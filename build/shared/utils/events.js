"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * A tiny EventEmitter implementation for the browser.
 */
class EventEmitter {
  constructor() {
    _defineProperty(this, "listeners", {});
    _defineProperty(this, "on", this.addListener);
    _defineProperty(this, "off", this.removeListener);
  }
  addListener(name, callback) {
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push(callback);
  }
  removeListener(name, callback) {
    this.listeners[name] = this.listeners[name]?.filter(cb => cb !== callback);
  }
  emit(name, data) {
    this.listeners[name]?.forEach(callback => {
      callback(data);
    });
  }
}
exports.default = EventEmitter;