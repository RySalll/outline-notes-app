"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UrlHelper = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class UrlHelper {}
exports.UrlHelper = UrlHelper;
_defineProperty(UrlHelper, "github", "https://www.github.com/outline/outline/issues");
_defineProperty(UrlHelper, "twitter", "https://twitter.com/getoutline");
_defineProperty(UrlHelper, "contact", "https://www.getoutline.com/contact");
_defineProperty(UrlHelper, "developers", "https://www.getoutline.com/developers");
_defineProperty(UrlHelper, "changelog", "https://www.getoutline.com/changelog");
_defineProperty(UrlHelper, "guide", "https://docs.getoutline.com/s/guide");
_defineProperty(UrlHelper, "SLUG_URL_REGEX", /^(?:[0-9a-zA-Z-_~]*-)?([a-zA-Z0-9]{10,15})$/);
_defineProperty(UrlHelper, "SHARE_URL_SLUG_REGEX", /^[0-9a-z-]+$/);