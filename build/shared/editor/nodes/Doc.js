"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Doc extends _Node.default {
  get name() {
    return "doc";
  }
  get schema() {
    return {
      content: "block+"
    };
  }
}
exports.default = Doc;