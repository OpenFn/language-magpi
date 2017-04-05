'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.submitRecord = submitRecord;
exports.fetchSurveyData = fetchSurveyData;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _url = require('url');

var _js2xmlparser = require('js2xmlparser');

var _js2xmlparser2 = _interopRequireDefault(_js2xmlparser);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _xml2json = require('xml2json');

var _xml2json2 = _interopRequireDefault(_xml2json);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// var parser = require('xml2json');
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
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
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
function submitRecord(data) {

  return function (state) {
    var jsonBody = (0, _languageCommon.expandReferences)(data)(state);
    var body = (0, _js2xmlparser2.default)("form", jsonBody);

    var _state$configuration = state.configuration,
        username = _state$configuration.username,
        password = _state$configuration.password,
        apiUrl = _state$configuration.apiUrl;


    var url = (0, _url.resolve)(apiUrl + '/', 'mobileApi/uploadData');
    //const url = 'https://www.magpi.com/mobileApi/uploadData'

    console.log("Posting to url: ".concat(url));
    console.log("Raw JSON body: ".concat(JSON.stringify(jsonBody)));
    console.log("X-form submission: ".concat(body));

    // return post({ url, body })
    // .then((result) => {
    //   console.log("Success:", result);
    //   return { ...state, references: [ result, ...state.references ] }
    // })
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
function fetchSurveyData(params) {

  return function (state) {
    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        formId = _expandReferences.formId,
        afterDate = _expandReferences.afterDate,
        beforeDate = _expandReferences.beforeDate,
        postUrl = _expandReferences.postUrl;

    var _state$configuration2 = state.configuration,
        accessToken = _state$configuration2.accessToken,
        username = _state$configuration2.username;


    var enddate = beforeDate || "2100-01-01 12:00:00";
    var startdate = state.lastSubmissionDate || afterDate;

    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    };

    var url = "https://www.magpi.com/api/surveydata/v2";
    // const url = "http://requestb.in/1gdsvvh1";
    var form = {
      username: username,
      accesstoken: accessToken,
      surveyid: formId,
      startdate: startdate,
      enddate: enddate
    };

    console.log(form);

    _request2.default.post({ url: url, form: form }, function (error, response, body) {
      console.log(response);
      var jsonBody = JSON.parse(_xml2json2.default.toJson(body));
      console.log(JSON.stringify(jsonBody));
      _request2.default.post({
        url: postUrl,
        json: jsonBody
      }, function (error, response, postResponseBody) {
        error = assembleError({
          error: error,
          response: response
        });
        if (error) {
          console.error("POST failed.");
          reject(error);
        } else {
          console.log("POST succeeded.");
        }
      });
    }); // request.post()
  };
};
