"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _invariant = _interopRequireDefault(require("invariant"));
var _oauth = _interopRequireDefault(require("./../../../server/utils/oauth"));
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class GoogleClient extends _oauth.default {
  constructor() {
    (0, _invariant.default)(_env.default.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID is required");
    (0, _invariant.default)(_env.default.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET is required");
    super(_env.default.GOOGLE_CLIENT_ID, _env.default.GOOGLE_CLIENT_SECRET);
    _defineProperty(this, "endpoints", {
      authorize: "https://accounts.google.com/o/oauth2/auth",
      token: "https://accounts.google.com/o/oauth2/token",
      userinfo: "https://www.googleapis.com/oauth2/v3/userinfo"
    });
  }
}
exports.default = GoogleClient;