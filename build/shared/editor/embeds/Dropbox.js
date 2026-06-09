"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Dropbox(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  // "fi" = file
  // "fo" = folder
  // Files need more vertical space to be readable
  const embedHeight = matches[3].split("/")[0] === "fi" ? "550px" : "350px";

  // Wrap inside an iframe to isolate external script and losened CSP
  return /*#__PURE__*/React.createElement(_Frame.default, {
    src: `/embeds/dropbox?url=${encodeURIComponent(props.attrs.href)}`,
    className: props.isSelected ? "ProseMirror-selectednode" : "",
    width: "100%",
    height: embedHeight,
    title: "Dropbox"
  });
}
var _default = exports.default = Dropbox;