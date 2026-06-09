"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMathView = createMathView;
exports.default = void 0;
var _prosemirrorMath = require("@benrbray/prosemirror-math");
var _prosemirrorState = require("prosemirror-state");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const MATH_PLUGIN_KEY = new _prosemirrorState.PluginKey("prosemirror-math");
function createMathView(displayMode) {
  return (node, view, getPos) => {
    // dynamically load katex styles and fonts
    Promise.resolve().then(() => _interopRequireWildcard(require("katex/dist/katex.min.css")));
    const pluginState = MATH_PLUGIN_KEY.getState(view.state);
    if (!pluginState) {
      throw new Error("no math plugin!");
    }
    const nodeViews = pluginState.activeNodeViews;

    // set up NodeView
    const nodeView = new _prosemirrorMath.MathView(node, view, getPos, {
      katexOptions: {
        displayMode,
        output: "html",
        macros: pluginState.macros
      }
    }, MATH_PLUGIN_KEY, () => {
      nodeViews.splice(nodeViews.indexOf(nodeView));
    });
    nodeViews.push(nodeView);
    return nodeView;
  };
}
const mathPluginSpec = {
  key: MATH_PLUGIN_KEY,
  state: {
    init() {
      return {
        macros: {},
        activeNodeViews: [],
        prevCursorPos: 0
      };
    },
    apply(tr, value, oldState) {
      return {
        activeNodeViews: value.activeNodeViews,
        macros: value.macros,
        prevCursorPos: oldState.selection.from
      };
    }
  },
  props: {
    nodeViews: {
      math_inline: createMathView(false),
      math_block: createMathView(true)
    }
  }
};
var _default = exports.default = new _prosemirrorState.Plugin(mathPluginSpec);