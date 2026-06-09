"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _toggleList = _interopRequireDefault(require("../commands/toggleList"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class OrderedList extends _Node.default {
  get name() {
    return "ordered_list";
  }
  get schema() {
    return {
      attrs: {
        order: {
          default: 1,
          validate: "number"
        }
      },
      content: "list_item+",
      group: "block list",
      parseDOM: [{
        tag: "ol",
        getAttrs: dom => ({
          order: dom.hasAttribute("start") ? parseInt(dom.getAttribute("start") || "1", 10) : 1
        })
      }],
      toDOM: node => node.attrs.order === 1 ? ["ol", 0] : ["ol", {
        start: node.attrs.order
      }, 0]
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
      "Shift-Ctrl-9": (0, _toggleList.default)(type, schema.nodes.list_item)
    };
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [(0, _prosemirrorInputrules.wrappingInputRule)(/^(\d+)\.\s$/, type, match => ({
      order: +match[1]
    }), (match, node) => node.childCount + node.attrs.order === +match[1])];
  }
  toMarkdown(state, node) {
    state.write("\n");
    const start = node.attrs.order !== undefined ? node.attrs.order : 1;
    const maxW = `${start + node.childCount - 1}`.length;
    const space = state.repeat(" ", maxW + 2);
    state.renderList(node, space, index => {
      const nStr = `${start + index}`;
      return state.repeat(" ", maxW - nStr.length) + nStr + ". ";
    });
  }
  parseMarkdown() {
    return {
      block: "ordered_list",
      getAttrs: tok => ({
        order: parseInt(tok.attrGet("start") || "1", 10)
      })
    };
  }
}
exports.default = OrderedList;