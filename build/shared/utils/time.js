"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Second = exports.Minute = exports.Hour = exports.Day = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Second {}
exports.Second = Second;
/** Milliseconds in a second */
_defineProperty(Second, "ms", 1000);
class Minute {}
exports.Minute = Minute;
/** Milliseconds in a minute */
_defineProperty(Minute, "ms", 60 * Second.ms);
/** Seconds in a minute */
_defineProperty(Minute, "seconds", 60);
class Hour {}
exports.Hour = Hour;
/** Milliseconds in an hour */
_defineProperty(Hour, "ms", 60 * Minute.ms);
/** Seconds in an hour */
_defineProperty(Hour, "seconds", 60 * Minute.seconds);
/** Minutes in an hour */
_defineProperty(Hour, "minutes", 60);
class Day {}
exports.Day = Day;
/** Milliseconds in a day */
_defineProperty(Day, "ms", 24 * Hour.ms);
/** Seconds in a day */
_defineProperty(Day, "seconds", 24 * Hour.seconds);
/** Minutes in a day */
_defineProperty(Day, "minutes", 24 * Hour.minutes);