"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../styles");
var _Squircle = _interopRequireDefault(require("./Squircle"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * A squircle shaped icon with a letter inside, used for collections.
 */
const LetterIcon = _ref => {
  let {
    children,
    size = 24,
    ...rest
  } = _ref;
  return /*#__PURE__*/React.createElement(LetterIconWrapper, {
    $size: size
  }, /*#__PURE__*/React.createElement(_Squircle.default, _extends({
    size: Math.round(size * 0.66)
  }, rest), children ?? "?"));
};
const LetterIconWrapper = _styledComponents.default.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${_ref2 => {
  let {
    $size
  } = _ref2;
  return $size;
}}px;
  height: ${_ref3 => {
  let {
    $size
  } = _ref3;
  return $size;
}}px;

  font-weight: 700;
  font-size: ${_ref4 => {
  let {
    $size
  } = _ref4;
  return $size / 2;
}}px;
  color: ${(0, _styles.s)("background")};
`;
var _default = exports.default = LetterIcon;