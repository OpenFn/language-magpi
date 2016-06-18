import { execute as commonExecute, expandReferences } from 'language-common';
import { post } from './Client';
import { resolve as resolveUrl } from 'url';

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
 * Submit a form
 * @example
 * execute(
 *   submitForm(data)
 * )(state)
 * @constructor
 * @param {object} submitForm - Payload data for the form
 * @returns {Operation}
 */
export function submitForm(data) {

  return state => {
    const body = expandReferences(data)(state);

    const { username, password, apiUrl } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/events')

    console.log("Posting form submission:");
    console.log(body)

    return post({ username, password, body, url })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

export {
  field, fields, sourceValue,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
