"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _toggleWrap = _interopRequireDefault(require("../commands/toggleWrap"));
var _isNodeActive = require("../queries/isNodeActive");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Blockquote extends _Node.default {
  get name() {
    return "blockquote";
  }
  get schema() {
    return {
      content: "block+",
      group: "block",
      defining: true,
      parseDOM: [{
        tag: "blockquote"
      },
      // Dropbox Paper parsing, yes their quotes are actually lists
      {
        tag: "ul.listtype-quote",
        contentElement: "li"
      }],
      toDOM: () => ["blockquote", 0]
    };
  }
  inputRules(_ref) {
    let {
      type
    } = _ref;
    return [(0, _prosemirrorInputrules.wrappingInputRule)(/^\s*>\s$/, type)];
  }
  commands(_ref2) {
    let {
      type
    } = _ref2;
    return () => (0, _toggleWrap.default)(type);
  }
  keys(_ref3) {
    let {
      type
    } = _ref3;
    return {
      "Ctrl->": (0, _toggleWrap.default)(type),
      "Mod-]": (0, _toggleWrap.default)(type),
      "Shift-Enter": (state, dispatch) => {
        if (!(0, _isNodeActive.isNodeActive)(type)(state)) {
          return false;
        }
        const {
          tr,
          selection
        } = state;
        dispatch?.(tr.split(selection.to));
        return true;
      }
    };
  }
  toMarkdown(state, node) {
    state.wrapBlock("> ", undefined, node, () => state.renderContent(node));
  }
  parseMarkdown() {
    return {
      block: "blockquote"
    };
  }
}
exports.default = Blockquote;