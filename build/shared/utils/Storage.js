"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Storage is a wrapper class for localStorage that allow safe usage when
 * localStorage is not available.
 */
class Storage {
  constructor() {
    _defineProperty(this, "interface", void 0);
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      this.interface = localStorage;
    } catch (_err) {
      this.interface = new MemoryStorage();
    }
  }

  /**
   * Set a value in storage. For efficiency, this method will remove the
   * value if it is undefined.
   *
   * @param key The key to set under.
   * @param value The value to set
   */
  set(key, value) {
    try {
      if (value === undefined) {
        this.remove(key);
      } else {
        this.interface.setItem(key, JSON.stringify(value));
      }
    } catch (_err) {
      // Ignore errors
    }
  }

  /**
   * Get a value from storage.
   *
   * @param key The key to get.
   * @param fallback The fallback value if the key doesn't exist.
   * @returns The value or undefined if it doesn't exist.
   */
  get(key, fallback) {
    try {
      const value = this.interface.getItem(key);
      if (typeof value === "string") {
        return JSON.parse(value);
      }
    } catch (_err) {
      // Ignore errors
    }
    return fallback;
  }

  /**
   * Remove a value from storage.
   *
   * @param key The key to remove.
   */
  remove(key) {
    try {
      this.interface.removeItem(key);
    } catch (_err) {
      // Ignore errors
    }
  }
}

/**
 * MemoryStorage is a simple in-memory storage implementation that is used
 * when localStorage is not available.
 */
class MemoryStorage {
  constructor() {
    _defineProperty(this, "data", {});
  }
  getItem(key) {
    return this.data[key] || null;
  }
  setItem(key, value) {
    return this.data[key] = String(value);
  }
  removeItem(key) {
    return delete this.data[key];
  }
  clear() {
    return this.data = {};
  }
}
var _default = exports.default = new Storage();