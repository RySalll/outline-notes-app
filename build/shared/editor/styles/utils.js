"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cn = cn;
/**
 * Combines class names into a single string. If the value is an object, it will only include keys
 * with a truthy value.
 *
 * @param classNames An array of class names
 * @returns A single string of class names
 */
function cn() {
  for (var _len = arguments.length, classNames = new Array(_len), _key = 0; _key < _len; _key++) {
    classNames[_key] = arguments[_key];
  }
  return classNames.filter(Boolean).map(item => {
    if (typeof item === "object") {
      return Object.entries(item).filter(_ref => {
        let [, value] = _ref;
        return value;
      }).map(_ref2 => {
        let [key] = _ref2;
        return key;
      }).join(" ");
    }
    return item;
  }).join(" ");
}