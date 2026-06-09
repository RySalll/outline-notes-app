"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _markInputRule = require("../lib/markInputRule");
var _Mark = _interopRequireDefault(require("./Mark"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const heavyWeightRegex = /^(bold(er)?|[5-9]\d{2,})$/;
const normalWeightRegex = /^(normal|[1-4]\d{2,})$/;
class Bold extends _Mark.default {
  get name() {
    return "strong";
  }
  get schema() {
    return {
      parseDOM: [{
        tag: "b",
        // Google Docs includes <b> tags with font-weight: normal so we need
        // to account for this case specifically as not becoming bold when pasted.
        getAttrs: dom => normalWeightRegex.test(dom.style.fontWeight) ? false : null
      }, {
        tag: "strong"
      }, {
        style: "font-weight",
        getAttrs: style => heavyWeightRegex.test(style) && null
      }],
      toDOM: () => ["strong"]
    };
  }
  inputRules(_ref) {
    let {
      type
    } = _ref;
    return [(0, _markInputRule.markInputRuleForPattern)("**", type)];
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Mod-b": (0, _prosemirrorCommands.toggleMark)(type),
      "Mod-B": (0, _prosemirrorCommands.toggleMark)(type)
    };
  }
  toMarkdown() {
    return {
      open: "**",
      close: "**",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
  parseMarkdown() {
    return {
      mark: "strong"
    };
  }
}
exports.default = Bold;