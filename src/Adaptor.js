import { execute as commonExecute, expandReferences } from 'language-common';
import { resolve as resolveUrl } from 'url';
import js2xmlparser from 'js2xmlparser';
import request from 'request';
import parser from 'xml2json';
/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for magpi.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}

/**
 * Make a POST request to fetch Magpi data and POST it somewhere else
 * https://www.magpi.com/api/surveydata/v2?username=taylordowns2000&accesstoken=BLAHBLAHBLAH&surveyid=921409679070
 * @example
 * execute(
 *   fetchSurveyData(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
export function fetchSurveyData(params) {

  return state => {

    // an error helper function...
    function assembleError({ response, error }) {
      if (response && ([200, 201, 202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    };

    const { formId, afterDate, beforeDate, postUrl } = expandReferences(params)(state);

    const { accessToken, username } = state.configuration;

    // Remove this once API is updated to make beforedate optional...
    const enddate = ( beforeDate || "2100-01-01 12:00:00" );

    const startdate = ( state.lastSubmissionDate || afterDate );

    const url = "https://www.magpi.com/api/surveydata/v2";

    const form = {
      username,
      accesstoken: accessToken,
      surveyid: formId,
      startdate,
      enddate
    };

    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        url: url,
        form: form
      }, (error, response, body) => {
        error = assembleError({ error, response })
        if (error) {
          console.log("Failed to fetch submission data.")
          reject(error);
        } else {
          console.log("Successfully fetched submission data.")
          const jsonBody = JSON.parse(parser.toJson(body));
          var submissions = jsonBody.SurveyDataList.SurveyData;
          console.log(`Converted ${submissions.length} submission(s) to JSON:`)
          console.log(submissions);
          resolve(submissions);
        }
      })
    })
    .then((submissions) => {
      submissions.forEach((item) => {
        item.formId = formId;
        item.source = "Magpi API"
        console.log(item)
        request.post({
          url: postUrl,
          json: item
        }, (error, response, postResponseBody) => {
          error = assembleError({ error, response })
          if (error) {
            console.error("POST failed.")
            console.log(error)
          } else {
            console.log("POST succeeded.");
          }
        })
      });
      return submissions;
    })
    .catch((error) => {
      throw(error);
    })
    .then((submissions) => {
      if (submissions.length) {
        // TODO: if Magpi API does not return in date order, find oldest...
        state.lastSubmissionDate = submissions[0].LastSubmissionDate
      }
      // Set the lastSubmissionDate for the next time the job runs.
      return state;
    });

  } // done returning state.

}; // done with exported function.

/**
 * Submit a record for a form/survey which already exists in a Magpi user account
 * @example
 * execute(
 *   submitRecord(data)
 * )(state)
 * @constructor
 * @param {object} submitRecord - Payload data for the record
 * @returns {Operation}
 */
export function submitRecord(data) {

  return state => {
    const jsonBody = expandReferences(data)(state);
    const body = js2xmlparser("form", jsonBody);

    const {
      username,
      password,
      apiUrl
    } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'mobileApi/uploadData')
    //const url = 'https://www.magpi.com/mobileApi/uploadData'

    console.log("Posting to url: ".concat(url));
    console.log("Raw JSON body: ".concat(JSON.stringify(jsonBody)));
    console.log("X-form submission: ".concat(body));

    // return post({ url, body })
    // .then((result) => {
    //   console.log("Success:", result);
    //   return { ...state, references: [ result, ...state.references ] }
    // })

  }
}

export {
  field,
  fields,
  sourceValue,
  each,
  merge,
  dataPath,
  dataValue,
  lastReferenceValue
}
from 'language-common';
