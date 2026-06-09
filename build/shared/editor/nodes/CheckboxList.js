"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _toggleList = _interopRequireDefault(require("../commands/toggleList"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CheckboxList extends _Node.default {
  get name() {
    return "checkbox_list";
  }
  get schema() {
    return {
      group: "block list",
      content: "checkbox_item+",
      toDOM: () => ["ul", {
        class: this.name
      }, 0],
      parseDOM: [{
        tag: `[class="${this.name}"]`
      }]
    };
  }
  keys(_ref) {
    let {
      type,
      schema
    } = _ref;
    return {
      "Shift-Ctrl-7": (0, _toggleList.default)(type, schema.nodes.checkbox_item)
    };
  }
  commands(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    return () => (0, _toggleList.default)(type, schema.nodes.checkbox_item);
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [(0, _prosemirrorInputrules.wrappingInputRule)(/^-?\s*(\[ \])\s$/i, type)];
  }
  toMarkdown(state, node) {
    state.renderList(node, "  ", () => "- ");
  }
  parseMarkdown() {
    return {
      block: "checkbox_list"
    };
  }
}
exports.default = CheckboxList;