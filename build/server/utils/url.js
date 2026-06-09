"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateUrlId = void 0;
var _randomstring = _interopRequireDefault(require("randomstring"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const UrlIdLength = 10;
const generateUrlId = () => _randomstring.default.generate(UrlIdLength);
exports.generateUrlId = generateUrlId;