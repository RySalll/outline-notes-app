"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetch;
var _fetchWithProxy = _interopRequireDefault(require("fetch-with-proxy"));
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _requestFilteringAgent = require("request-filtering-agent");
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable no-restricted-imports */

/**
 * Wrapper around fetch that uses the request-filtering-agent in cloud hosted
 * environments to filter malicious requests, and the fetch-with-proxy library
 * in self-hosted environments to allow for request from behind a proxy.
 *
 * @param url The url to fetch
 * @param init The fetch init object
 * @returns The response
 */
async function fetch(url, init) {
  // In self-hosted, webhooks support proxying and are also allowed to connect
  // to internal services, so use fetchWithProxy without the filtering agent.
  const fetchMethod = _env.default.isCloudHosted ? _nodeFetch.default : _fetchWithProxy.default;
  _Logger.default.silly("http", `Network request to ${url}`, init);
  const response = await fetchMethod(url, {
    ...init,
    agent: _env.default.isCloudHosted ? (0, _requestFilteringAgent.useAgent)(url) : undefined
  });
  if (!response.ok) {
    _Logger.default.silly("http", `Network request failed`, {
      url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers.raw()
    });
  }
  return response;
}