"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitHubUtils = void 0;
var _queryString = _interopRequireDefault(require("query-string"));
var _env = _interopRequireDefault(require("./../../../shared/env"));
var _routeHelpers = require("./../../../shared/utils/routeHelpers");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class GitHubUtils {
  static get url() {
    return (0, _routeHelpers.integrationSettingsPath)("github");
  }

  /**
   * @param error
   * @returns URL to be redirected to upon authorization error from GitHub
   */
  static errorUrl(error) {
    return `${this.url}?error=${error}`;
  }

  /**
   * @returns Callback URL configured for GitHub, to which users will be redirected upon authorization
   */
  static callbackUrl() {
    let {
      baseUrl,
      params
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      baseUrl: `${_env.default.URL}`,
      params: undefined
    };
    return params ? `${baseUrl}/api/github.callback?${params}` : `${baseUrl}/api/github.callback`;
  }
  static authUrl(state) {
    const baseUrl = `https://github.com/apps/${_env.default.GITHUB_APP_NAME}/installations/new`;
    const params = {
      client_id: this.clientId,
      redirect_uri: this.callbackUrl(),
      state
    };
    return `${baseUrl}?${_queryString.default.stringify(params)}`;
  }
  static installRequestUrl() {
    return `${this.url}?install_request=true`;
  }
  static getColorForStatus(status) {
    switch (status) {
      case "open":
        return "#238636";
      case "done":
        return "#a371f7";
      case "closed":
        return "#f85149";
      case "merged":
        return "#8250df";
      case "canceled":
      default:
        return "#848d97";
    }
  }
}
exports.GitHubUtils = GitHubUtils;
_defineProperty(GitHubUtils, "clientId", _env.default.GITHUB_CLIENT_ID);