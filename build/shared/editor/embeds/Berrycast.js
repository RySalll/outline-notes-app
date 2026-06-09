"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Berrycast;
var React = _interopRequireWildcard(require("react"));
var _useComponentSize = require("../../hooks/useComponentSize");
var _Frame = _interopRequireDefault(require("../components/Frame"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Berrycast(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  const normalizedUrl = props.attrs.href.replace(/\/$/, "");
  const ref = React.useRef(null);
  const {
    width
  } = (0, _useComponentSize.useComponentSize)(ref.current);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: ref
  }), /*#__PURE__*/React.createElement(_Frame.default, _extends({}, props, {
    src: `${normalizedUrl}/video-player`,
    title: "Berrycast Embed",
    height: `${0.5625 * width}px`,
    border: false
  })));
}