import { execute as commonExecute, expandReferences } from 'language-common';
import { post } from './Client';
import { resolve as resolveUrl } from 'url';
import js2xmlparser from 'js2xmlparser';

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

    return post({ url, body })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

export {
  field, fields, sourceValue, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
