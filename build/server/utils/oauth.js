"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _errors = require("../errors");
var _fetch = _interopRequireDefault(require("./fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class OAuthClient {
  constructor(clientId, clientSecret) {
    _defineProperty(this, "clientId", void 0);
    _defineProperty(this, "clientSecret", void 0);
    _defineProperty(this, "endpoints", {
      authorize: "",
      token: "",
      userinfo: ""
    });
    _defineProperty(this, "userInfo", async accessToken => {
      let data;
      let response;
      try {
        response = await (0, _fetch.default)(this.endpoints.userinfo, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
        data = await response.json();
      } catch (err) {
        throw (0, _errors.InvalidRequestError)(err.message);
      }
      const success = response.status >= 200 && response.status < 300;
      if (!success) {
        throw (0, _errors.AuthenticationError)();
      }
      return data;
    });
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }
  async rotateToken(_accessToken, refreshToken) {
    let endpoint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.endpoints.token;
    let data;
    let response;
    try {
      _Logger.default.debug("utils", "Rotating token", {
        endpoint
      });
      response = await (0, _fetch.default)(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token"
        })
      });
      data = await response.json();
    } catch (err) {
      throw (0, _errors.InvalidRequestError)(err.message);
    }
    const success = response.status >= 200 && response.status < 300;
    if (!success) {
      throw (0, _errors.AuthenticationError)();
    }
    return {
      refreshToken: data.refresh_token,
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
  }
}
exports.default = OAuthClient;