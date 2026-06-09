"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorMath = require("@benrbray/prosemirror-math");
var _prosemirrorCommands = require("prosemirror-commands");
var _Math = _interopRequireDefault(require("../extensions/Math"));
var _math = _interopRequireWildcard(require("../rules/math"));
var _Node = _interopRequireDefault(require("./Node"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Math extends _Node.default {
  get name() {
    return "math_inline";
  }
  get schema() {
    return _prosemirrorMath.mathSchemaSpec.nodes.math_inline;
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
  inputRules(_ref2) {
    let {
      schema
    } = _ref2;
    return [(0, _prosemirrorMath.makeInlineMathInputRule)(_math.REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline)];
  }
  keys(_ref3) {
    let {
      type
    } = _ref3;
    return {
      "Mod-Space": (0, _prosemirrorMath.insertMathCmd)(type),
      Backspace: (0, _prosemirrorCommands.chainCommands)(_prosemirrorCommands.deleteSelection, _prosemirrorMath.mathBackspaceCmd, _prosemirrorCommands.joinBackward, _prosemirrorCommands.selectNodeBackward)
    };
  }
  get plugins() {
    return [_Math.default];
  }
  get rulePlugins() {
    return [_math.default];
  }
  toMarkdown(state, node) {
    state.write("$");
    state.text(node.textContent, false);
    state.write("$");
  }
  parseMarkdown() {
    return {
      node: "math_inline",
      block: "math_inline",
      noCloseToken: true
    };
  }
}
exports.default = Math;