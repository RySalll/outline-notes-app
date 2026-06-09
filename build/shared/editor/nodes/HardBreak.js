"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorTables = require("prosemirror-tables");
var _isInCode = require("../queries/isInCode");
var _isNodeActive = require("../queries/isNodeActive");
var _breaks = _interopRequireDefault(require("../rules/breaks"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class HardBreak extends _Node.default {
  get name() {
    return "br";
  }
  get schema() {
    return {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{
        tag: "br"
      }],
      toDOM: () => ["br"],
      toPlainText: () => "\n"
    };
  }
  get rulePlugins() {
    return [_breaks.default];
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return () => (state, dispatch) => {
      dispatch?.(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      return true;
    };
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Shift-Enter": (state, dispatch) => {
        const isParagraphActive = (0, _isNodeActive.isNodeActive)(state.schema.nodes.paragraph)(state);
        if (!(0, _prosemirrorTables.isInTable)(state) && !isParagraphActive || (0, _isInCode.isInCode)(state, {
          onlyBlock: true
        })) {
          return false;
        }
        dispatch?.(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
        return true;
      }
    };
  }
  toMarkdown(state) {
    state.write(state.options.softBreak ? "\n" : "\\n");
  }
  parseMarkdown() {
    return {
      node: "br"
    };
  }
}
exports.default = HardBreak;