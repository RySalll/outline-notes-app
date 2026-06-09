"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SlackUtils = void 0;
var _env = _interopRequireDefault(require("./../../../shared/env"));
var _routeHelpers = require("./../../../shared/utils/routeHelpers");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class SlackUtils {
  /**
   * Create a state string for use in OAuth flows
   *
   * @param teamId The team ID
   * @param type The integration type
   * @param data Additional data to include in the state
   * @returns A state string
   */
  static createState(teamId, type, data) {
    return JSON.stringify({
      type,
      teamId,
      ...data
    });
  }

  /**
   * Parse a state string from an OAuth flow
   *
   * @param state The state string
   * @returns The parsed state
   */
  static parseState(state) {
    return JSON.parse(state);
  }
  static callbackUrl() {
    let {
      baseUrl,
      params
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      baseUrl: `${_env.default.URL}`,
      params: undefined
    };
    return params ? `${baseUrl}/auth/slack.callback?${params}` : `${baseUrl}/auth/slack.callback`;
  }
  static connectUrl() {
    let {
      baseUrl,
      params
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      baseUrl: `${_env.default.URL}`,
      params: undefined
    };
    return params ? `${baseUrl}/auth/slack.post?${params}` : `${baseUrl}/auth/slack.post`;
  }
  static errorUrl(err) {
    return (0, _routeHelpers.integrationSettingsPath)(`slack?error=${err}`);
  }
  static get url() {
    return (0, _routeHelpers.integrationSettingsPath)("slack");
  }
  static authUrl(state) {
    let scopes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["identity.email", "identity.basic", "identity.avatar", "identity.team"];
    let redirectUri = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : SlackUtils.callbackUrl();
    const baseUrl = SlackUtils.authBaseUrl;
    const params = {
      client_id: _env.default.SLACK_CLIENT_ID,
      scope: scopes ? scopes.join(" ") : "",
      redirect_uri: redirectUri,
      state
    };
    const urlParams = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join("&");
    return `${baseUrl}?${urlParams}`;
  }
}
exports.SlackUtils = SlackUtils;
_defineProperty(SlackUtils, "authBaseUrl", "https://slack.com/oauth/authorize");