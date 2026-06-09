"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _toggleList = _interopRequireDefault(require("../commands/toggleList"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class BulletList extends _Node.default {
  get name() {
    return "bullet_list";
  }
  get schema() {
    return {
      content: "list_item+",
      group: "block list",
      parseDOM: [{
        tag: "ul"
      }],
      toDOM: () => ["ul", 0]
    };
  }
  commands(_ref) {
    let {
      type,
      schema
    } = _ref;
    return () => (0, _toggleList.default)(type, schema.nodes.list_item);
  }
  keys(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    return {
      "Shift-Ctrl-8": (0, _toggleList.default)(type, schema.nodes.list_item)
    };
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [(0, _prosemirrorInputrules.wrappingInputRule)(/^\s*([-+*])\s$/, type)];
  }
  toMarkdown(state, node) {
    state.renderList(node, "  ", () => (node.attrs.bullet || "*") + " ");
  }
  parseMarkdown() {
    return {
      block: "bullet_list"
    };
  }
}
exports.default = BulletList;