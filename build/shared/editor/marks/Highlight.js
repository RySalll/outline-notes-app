"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _polished = require("polished");
var _prosemirrorCommands = require("prosemirror-commands");
var _markInputRule = require("../lib/markInputRule");
var _mark = _interopRequireDefault(require("../rules/mark"));
var _Mark = _interopRequireDefault(require("./Mark"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Highlight extends _Mark.default {
  get name() {
    return "highlight";
  }
  get schema() {
    return {
      attrs: {
        color: {
          default: null,
          validate: "string|null"
        }
      },
      parseDOM: [{
        tag: "mark",
        getAttrs: dom => {
          const color = dom.getAttribute("data-color") || "";
          return {
            color: Highlight.colors.includes(color) ? color : null
          };
        }
      }],
      toDOM: node => ["mark", {
        "data-color": node.attrs.color,
        style: `background-color: ${(0, _polished.rgba)(node.attrs.color || Highlight.colors[0], Highlight.opacity)}`
      }]
    };
  }
  inputRules(_ref) {
    let {
      type
    } = _ref;
    return [(0, _markInputRule.markInputRuleForPattern)("==", type)];
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Mod-Ctrl-h": (0, _prosemirrorCommands.toggleMark)(type)
    };
  }
  get rulePlugins() {
    return [(0, _mark.default)({
      delim: "==",
      mark: "highlight"
    })];
  }
  toMarkdown() {
    return {
      open: "==",
      close: "==",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
  parseMarkdown() {
    return {
      mark: "highlight"
    };
  }
}
exports.default = Highlight;
/** The colors that can be used for highlighting */
_defineProperty(Highlight, "colors", ["#FDEA9B", "#FED46A", "#FA551E", "#B4DC19", "#C8AFF0", "#3CBEFC"]);
/** The names of the colors that can be used for highlighting, must match length of array above */
_defineProperty(Highlight, "colorNames", ["Coral", "Apricot", "Sunset", "Smoothie", "Bubblegum", "Neon"]);
/** The default opacity of the highlight */
_defineProperty(Highlight, "opacity", 0.4);