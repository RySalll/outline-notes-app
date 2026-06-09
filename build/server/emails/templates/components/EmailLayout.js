"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.baseStyles = void 0;
var _oyVey = require("oy-vey");
var React = _interopRequireWildcard(require("react"));
var _theme = _interopRequireDefault(require("./../../../../shared/styles/theme"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const EmailLayout = _ref => {
  let {
    previewText,
    bgcolor = "#FFFFFF",
    goToAction,
    children
  } = _ref;
  let markup;
  if (goToAction) {
    markup = JSON.stringify({
      "@context": "http://schema.org",
      "@type": "EmailMessage",
      potentialAction: {
        "@type": "ViewAction",
        url: goToAction.url,
        name: goToAction.name
      }
    });
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, markup ? /*#__PURE__*/React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: markup
    }
  }) : null, /*#__PURE__*/React.createElement(_oyVey.Table, {
    bgcolor: bgcolor,
    id: "__bodyTable__",
    width: "100%",
    style: {
      WebkitFontSmoothing: "antialiased",
      width: "100% !important",
      background: `${bgcolor}`,
      WebkitTextSizeAdjust: "none",
      margin: 0,
      padding: 0,
      minWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
    align: "center"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "none !important",
      color: `${bgcolor}`,
      margin: 0,
      padding: 0,
      fontSize: "1px",
      lineHeight: "1px"
    }
  }, previewText), /*#__PURE__*/React.createElement(_oyVey.Table, {
    width: "550"
  }, /*#__PURE__*/React.createElement(_oyVey.TBody, null, /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
    align: "left"
  }, children))))))));
};
var _default = exports.default = EmailLayout;
const baseStyles = exports.baseStyles = `
  #__bodyTable__ {
    font-family: ${_theme.default.fontFamily};
    font-size: 16px;
    line-height: 1.5;
  }
`;