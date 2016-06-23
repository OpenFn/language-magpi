'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.post = post;

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function post(_ref) {
  var url = _ref.url;
  var body = _ref.body;

  return new Promise(function (resolve, reject) {
    _superagent2.default.post(url).set('Authentication', 'e05c8b437e1243aa9079986bf702d602').set('Content-Type', 'application/xml').send(body).end(function (error, res) {
      if (!!error || !res.ok) {
        reject(error);
      }

      resolve(res);
    });
  });
}
