import { execute as commonExecute, expandReferences } from 'language-common';
import { resolve as resolveUrl } from 'url';
import js2xmlparser from 'js2xmlparser';
import Adaptor from 'language-http';
const { get, post } = Adaptor;

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

    const { username, password, apiUrl } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'mobileApi/uploadData')
    //const url = 'https://www.magpi.com/mobileApi/uploadData'

    console.log("Posting to url: ". concat(url));
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
 * Make a GET request and POST it somewhere else
 * https://www.magpi.com/api/surveydata/v2?username=taylordowns2000&accesstoken=BLAHBLAHBLAH&surveyid=921409679070
 * @example
 * execute(
 *   fetch(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
export function fetchSurveyData(formId, afterDate, postUrl) {
  return get(`forms/data/wide/json/${ formId }`, {
    query: function(state) {
      console.log("baseUrl: ".concat(state.configuration.baseUrl))
      return { date: state.lastSubmissionDate || afterDate }
    },
    callback: function(state) {
      // Pick submissions out in order to avoid `post` overwriting `response`.
      var submissions = state.response.body;
      // return submissions
      return submissions.reduce(function(acc, item) {
        // tag submissions as part of the identified form
        item.formId = formId;
        return acc.then(
          post( postUrl, { body: item })
        )
      }, Promise.resolve(state))
        .then(function(state) {
          if (submissions.length) {
            state.lastSubmissionDate = submissions[submissions.length-1].SubmissionDate
          }
          return state;
        })
        .then(function(state) {
          delete state.response
          console.log("fetchSubmissions succeeded.")
          return state;
        })
    }
  })
}

export {
  field, fields, sourceValue, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
