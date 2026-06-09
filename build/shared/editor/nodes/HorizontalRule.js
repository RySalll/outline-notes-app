"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class HorizontalRule extends _Node.default {
  get name() {
    return "hr";
  }
  get schema() {
    return {
      attrs: {
        markup: {
          default: "---"
        }
      },
      group: "block",
      parseDOM: [{
        tag: "hr"
      }],
      toDOM: node => ["hr", {
        class: node.attrs.markup === "***" ? "page-break" : ""
      }]
    };
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return attrs => (state, dispatch) => {
      dispatch?.(state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView());
      return true;
    };
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Mod-_": (state, dispatch) => {
        dispatch?.(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
        return true;
      }
    };
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [new _prosemirrorInputrules.InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
      const {
        tr
      } = state;
      if (match[0]) {
        const markup = match[0].trim();
        tr.replaceWith(start - 1, end, type.create({
          markup
        }));
      }
      return tr;
    })];
  }
  toMarkdown(state, node) {
    state.write(`\n${node.attrs.markup}`);
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      node: "hr",
      getAttrs: tok => ({
        markup: tok.markup
      })
    };
  }
}
exports.default = HorizontalRule;