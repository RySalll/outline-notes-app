"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EmojiIcon;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../styles");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * EmojiIcon is a component that renders an emoji in the size of a standard icon
 * in a way that can be used wherever an Icon would be.
 */
function EmojiIcon(_ref) {
  let {
    size = 24,
    emoji,
    ...rest
  } = _ref;
  return /*#__PURE__*/React.createElement(Span, _extends({
    $size: size
  }, rest), /*#__PURE__*/React.createElement(SVG, {
    size: size,
    emoji: emoji
  }));
}
const Span = _styledComponents.default.span`
  font-family: ${(0, _styles.s)("fontFamilyEmoji")};
  display: inline-block;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
`;
const SVG = _ref2 => {
  let {
    size,
    emoji
  } = _ref2;
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("text", {
    x: "50%",
    y: "55%",
    dominantBaseline: "middle",
    textAnchor: "middle",
    fontSize: size * 0.7
  }, emoji));
};