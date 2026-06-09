"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _Flex = _interopRequireDefault(require("./Flex"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Squircle = _ref => {
  let {
    color,
    size = 28,
    children,
    className
  } = _ref;
  return /*#__PURE__*/React.createElement(Wrapper, {
    size: size,
    align: "center",
    justify: "center",
    className: className
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    fill: color,
    viewBox: "0 0 28 28"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 11.1776C0 1.97285 1.97285 0 11.1776 0H16.8224C26.0272 0 28 1.97285 28 11.1776V16.8224C28 26.0272 26.0272 28 16.8224 28H11.1776C1.97285 28 0 26.0272 0 16.8224V11.1776Z"
  })), /*#__PURE__*/React.createElement(Content, null, children));
};
const Wrapper = (0, _styledComponents.default)(_Flex.default)`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;

  svg {
    transition: fill 150ms ease-in-out;
    transition-delay: var(--delay);
  }
`;
const Content = _styledComponents.default.div`
  display: flex;
  transform: translate(-50%, -50%);
  position: absolute;
  top: 50%;
  left: 50%;
`;
var _default = exports.default = Squircle;