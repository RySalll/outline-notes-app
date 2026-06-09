"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Node extends _Extension.default {
  get type() {
    return "node";
  }
  get schema() {
    return {};
  }
  get markdownToken() {
    return "";
  }
  inputRules(_options) {
    return [];
  }
  keys(_options) {
    return {};
  }
  commands(_options) {
    return {};
  }
  toMarkdown(_state, _node) {
    throw new Error("toMarkdown not implemented");
  }
  parseMarkdown() {
    return undefined;
  }
}
exports.default = Node;