import {
  execute as commonExecute,
  expandReferences
} from 'language-common';
import {
  resolve as resolveUrl
} from 'url';
import js2xmlparser from 'js2xmlparser';
import request from 'request';
var parser = require('xml2json');

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
    return commonExecute(...operations)({ ...initialState,
      ...state
    })
  };

}

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

    const {
      formId,
      beforeDate,
      afterDate,
      postUrl
    } = expandReferences(params)(state);
    const {
      accessToken,
      username
    } = state.configuration;

    function assembleError({
      response,
      error
    }) {
      if (response && ([200, 201, 202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    };

    const url = "https://www.magpi.com/api/surveydata/v2";
    const form = {
      username: username,
      accesstoken: accessToken,
      surveyid: formId
    };

    new Promise((resolve, reject) => {

      request.post({ url, form }, function(error, response, body) {
        console.log(body);
        const jsonBody = JSON.parse(parser.toJson(body));
        request.post({
          url: postUrl,
          json: jsonBody
        }, function(error, response, postResponseBody) {
          error = assembleError({
            error,
            response
          })
          if (error) {
            console.error("POST failed.")
            reject(error);
          } else {
            console.log("POST succeeded.");
          }
        })
      }); // close the request.get()
    }); // close the Promise.

  }

};

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
