"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Text extends _Node.default {
  get name() {
    return "text";
  }
  get schema() {
    return {
      group: "inline"
    };
  }
  toMarkdown(state, node) {
    state.text(node.text || "", undefined);
  }
}
exports.default = Text;