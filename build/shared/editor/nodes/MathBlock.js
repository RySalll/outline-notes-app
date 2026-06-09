"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorMath = require("@benrbray/prosemirror-math");
var _prosemirrorState = require("prosemirror-state");
var _math = _interopRequireWildcard(require("../rules/math"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class MathBlock extends _Node.default {
  get name() {
    return "math_block";
  }
  get schema() {
    return _prosemirrorMath.mathSchemaSpec.nodes.math_display;
  }
  get rulePlugins() {
    return [_math.default];
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return () => (state, dispatch) => {
      const tr = state.tr.replaceSelectionWith(type.create());
      dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(state.selection.from - 1))).scrollIntoView());
      return true;
    };
  }
  inputRules(_ref2) {
    let {
      type
    } = _ref2;
    return [(0, _prosemirrorMath.makeBlockMathInputRule)(_math.REGEX_BLOCK_MATH_DOLLARS, type)];
  }
  toMarkdown(state, node) {
    state.write("$$\n");
    state.text(node.textContent, false);
    state.ensureNewLine();
    state.write("$$");
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      node: "math_block",
      block: "math_block",
      noCloseToken: true
    };
  }
}
exports.default = MathBlock;