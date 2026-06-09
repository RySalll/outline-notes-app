"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Link = void 0;
var _oyVey = require("oy-vey");
var React = _interopRequireWildcard(require("react"));
var _theme = _interopRequireDefault(require("./../../../../shared/styles/theme"));
var _UrlHelper = require("./../../../../shared/utils/UrlHelper");
var _env = _interopRequireDefault(require("./../../../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Link = _ref => {
  let {
    href,
    children
  } = _ref;
  const linkStyle = {
    color: _theme.default.slate,
    fontWeight: 500,
    textDecoration: "none",
    marginRight: "10px"
  };
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    style: linkStyle
  }, children);
};
exports.Link = Link;
var _default = _ref2 => {
  let {
    unsubscribeUrl,
    children
  } = _ref2;
  const footerStyle = {
    padding: "20px 0",
    borderTop: `1px solid ${_theme.default.smokeDark}`,
    color: _theme.default.slate,
    fontSize: "14px"
  };
  const footerLinkStyle = {
    padding: "0",
    color: _theme.default.slate,
    fontSize: "14px"
  };
  const externalLinkStyle = {
    color: _theme.default.slate,
    textDecoration: "none",
    margin: "0 10px"
  };
  return /*#__PURE__*/React.createElement(_oyVey.Table, {
    width: "100%"
  }, /*#__PURE__*/React.createElement(_oyVey.TBody, null, /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
    style: footerStyle
  }, /*#__PURE__*/React.createElement(Link, {
    href: _env.default.URL
  }, _env.default.APP_NAME), /*#__PURE__*/React.createElement("a", {
    href: _UrlHelper.UrlHelper.twitter,
    style: externalLinkStyle
  }, "Twitter"))), unsubscribeUrl && /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
    style: footerLinkStyle
  }, /*#__PURE__*/React.createElement(Link, {
    href: unsubscribeUrl
  }, "Unsubscribe from these emails"))), children && /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
    style: footerLinkStyle
  }, children))));
};
exports.default = _default;