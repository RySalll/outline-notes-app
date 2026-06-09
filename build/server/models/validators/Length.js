"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Length;
var _size = _interopRequireDefault(require("lodash/size"));
var _sequelizeTypescript = require("sequelize-typescript");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A decorator that validates the size of a string based on lodash's size.
 * function. Useful for strings with unicode characters of variable lengths.
 */
function Length(_ref) {
  let {
    msg,
    min = 0,
    max
  } = _ref;
  return (target, propertyName) => (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validLength(value) {
        if ((0, _size.default)(value) > max || (0, _size.default)(value) < min) {
          throw new Error(msg);
        }
      }
    }
  });
}