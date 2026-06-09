"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.safeEqual = safeEqual;
var _crypto = _interopRequireDefault(require("crypto"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Compare two strings in constant time to prevent timing attacks.
 *
 * @param a The first string to compare
 * @param b The second string to compare
 * @returns Whether the strings are equal
 */
function safeEqual(a, b) {
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return _crypto.default.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}