'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.fetchSurveyData = fetchSurveyData;
exports.submitRecord = submitRecord;

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
 * Make a POST request to fetch Magpi data and POST it somewhere else
 * @public
 * @example
 * fetchSurveyData({
 *  "surveyId": "37479",
 *  "afterDate": "2017-09-27",
 *  "postUrl": "https://www.openfn.org/inbox/your-inbox-url"
 * })
 * @function
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
function fetchSurveyData(params) {

  return function (state) {

    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    };

    console.log(params.surveyId);

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        surveyId = _expandReferences.surveyId,
        afterDate = _expandReferences.afterDate,
        beforeDate = _expandReferences.beforeDate,
        postUrl = _expandReferences.postUrl;

    console.log(surveyId);

    var _state$configuration = state.configuration,
        accessToken = _state$configuration.accessToken,
        username = _state$configuration.username;


    var enddate = beforeDate;
    var startdate = state.lastSubmissionDate || afterDate;

    var url = "https://www.magpi.com/api/surveydata/v3";

    var form = {
      username: username,
      accesstoken: accessToken,
      surveyid: surveyId,
      startdate: startdate,
      enddate: enddate
    };

    console.log('Fetching Survey ' + form.surveyid + ' submissions from ' + url);
    console.log('Date filters: "' + form.startdate + '" to "' + form.enddate + '".');

    return new Promise(function (resolve, reject) {
      (0, _request2.default)({
        method: 'POST',
        url: url,
        form: form
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          console.log("Failed to fetch submission data.");
          console.log("Response body: " + response.body);
          reject(error);
        } else {
          var jsonBody = JSON.parse(_xml2json2.default.toJson(body));
          if (jsonBody.SurveyDataList.SurveyData) {
            console.log("Successfully fetched submission data.");

            // Coerce survey data into an array for iteration...
            if (jsonBody.SurveyDataList.SurveyData.length) {
              var submissions = jsonBody.SurveyDataList.SurveyData;
            } else {
              var submissions = [jsonBody.SurveyDataList.SurveyData];
            }

            console.log('Converted ' + submissions.length + ' submission(s) to JSON:');
            // console.log(submissions);
            resolve(submissions);
          } else {
            console.log("There is no survey data matching the current parameters.");
            resolve([]);
          }
        }
      });
    }).then(function (submissions) {
      submissions.forEach(function (item) {
        item.surveyId = surveyId;
        item.source = "Magpi API";
        console.log(item);
        _request2.default.post({
          url: postUrl,
          json: item
        }, function (error, response, postResponseBody) {
          error = assembleError({ error: error, response: response });
          if (error) {
            console.error("POST failed.");
            throw error;
          } else {
            console.log("POST succeeded.");
          }
        });
      });
      return submissions;
    }).then(function (submissions) {
      if (submissions.length) {
        // TODO: if Magpi API does not return in date order, find oldest...
        state.lastSubmissionDate = submissions[0].LastSubmissionDate;
        console.log('Set "lastSubmissionDate" for next run to: ' + submissions[0].LastSubmissionDate);
      }
      // Set the lastSubmissionDate for the next time the job runs.
      return state;
    });
  }; // done returning state.
}; // done with exported function.

/**
 * Submit a record for a form/survey which already exists in a Magpi user account
 * @public
 * @example
 * submitRecord(jsonData)
 * @function
 * @param {object} jsonData - Payload data for the record
 * @returns {Operation}
 */
function submitRecord(jsonData) {

  return function (state) {
    var jsonBody = (0, _languageCommon.expandReferences)(data)(state);
    var body = (0, _js2xmlparser2.default)("form", jsonBody);

    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        apiUrl = _state$configuration2.apiUrl;


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
