"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sleep = sleep;
/**
 * Returns a promise that resolves after a specified number of milliseconds.
 *
 * @param [delay=1] The number of milliseconds to wait before fulfilling the promise.
 */
function sleep() {
  let ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return new Promise(resolve => setTimeout(resolve, ms));
}