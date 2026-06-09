"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _markInputRule = require("../lib/markInputRule");
var _Mark = _interopRequireDefault(require("./Mark"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Italic extends _Mark.default {
  get name() {
    return "em";
  }
  get schema() {
    return {
      parseDOM: [{
        tag: "i"
      }, {
        tag: "em"
      }, {
        style: "font-style",
        getAttrs: value => value === "italic" ? null : false
      }],
      toDOM: () => ["em"]
    };
  }
  inputRules(_ref) {
    let {
      type
    } = _ref;
    return [(0, _markInputRule.markInputRuleForPattern)("_", type), (0, _markInputRule.markInputRuleForPattern)("*", type)];
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Mod-i": (0, _prosemirrorCommands.toggleMark)(type),
      "Mod-I": (0, _prosemirrorCommands.toggleMark)(type)
    };
  }
  toMarkdown() {
    return {
      open: "*",
      close: "*",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
  parseMarkdown() {
    return {
      mark: "em"
    };
  }
}
exports.default = Italic;