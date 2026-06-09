"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toggleMark = require("../commands/toggleMark");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Mark extends _Extension.default {
  get type() {
    return "mark";
  }
  get schema() {
    return {};
  }
  get markdownToken() {
    return "";
  }
  keys(_options) {
    return {};
  }
  inputRules(_options) {
    return [];
  }
  toMarkdown(_state, _node) {
    throw new Error("toMarkdown not implemented");
  }
  parseMarkdown() {
    return undefined;
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return attrs => (0, _toggleMark.toggleMark)(type, attrs);
  }
}
exports.default = Mark;