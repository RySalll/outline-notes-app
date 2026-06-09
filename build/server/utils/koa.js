"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileFromRequest = void 0;
var _isArray = _interopRequireDefault(require("lodash/isArray"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Get the first file from an incoming koa request
 *
 * @param request The incoming request
 * @returns The first file or undefined
 */
const getFileFromRequest = request => {
  const {
    files
  } = request;
  if (!files) {
    return undefined;
  }
  const file = Object.values(files)[0];
  if (!file) {
    return undefined;
  }
  return (0, _isArray.default)(file) ? file[0] : file;
};
exports.getFileFromRequest = getFileFromRequest;