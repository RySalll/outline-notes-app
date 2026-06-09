"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.oauthAccess = oauthAccess;
exports.post = post;
exports.request = request;
var _querystring = _interopRequireDefault(require("querystring"));
var _errors = require("./../../../server/errors");
var _fetch = _interopRequireDefault(require("./../../../server/utils/fetch"));
var _SlackUtils = require("../shared/SlackUtils");
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SLACK_API_URL = "https://slack.com/api";
async function post(endpoint, body) {
  let data;
  const token = body.token;
  try {
    const response = await (0, _fetch.default)(`${SLACK_API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    data = await response.json();
  } catch (err) {
    throw (0, _errors.InvalidRequestError)(err.message);
  }
  if (!data.ok) {
    throw (0, _errors.InvalidRequestError)(data.error);
  }
  return data;
}
async function request(endpoint, body) {
  let data;
  try {
    const response = await (0, _fetch.default)(`${SLACK_API_URL}/${endpoint}?${_querystring.default.stringify(body)}`);
    data = await response.json();
  } catch (err) {
    throw (0, _errors.InvalidRequestError)(err.message);
  }
  if (!data.ok) {
    throw (0, _errors.InvalidRequestError)(data.error);
  }
  return data;
}
async function oauthAccess(code) {
  let redirect_uri = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _SlackUtils.SlackUtils.callbackUrl();
  return request("oauth.access", {
    client_id: _env.default.SLACK_CLIENT_ID,
    client_secret: _env.default.SLACK_CLIENT_SECRET,
    redirect_uri,
    code
  });
}