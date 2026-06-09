"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MutexLock = void 0;
var _redlock = _interopRequireDefault(require("redlock"));
var _redis = _interopRequireDefault(require("./../storage/redis"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class MutexLock {
  /**
   * Returns the redlock instance
   */
  static get lock() {
    this.redlock ??= new _redlock.default([_redis.default.defaultClient], {
      retryJitter: 10,
      retryCount: 20,
      retryDelay: 200
    });
    return this.redlock;
  }
}
exports.MutexLock = MutexLock;
// Default expiry time for acquiring lock in milliseconds
_defineProperty(MutexLock, "defaultLockTimeout", 4000);
_defineProperty(MutexLock, "redlock", void 0);