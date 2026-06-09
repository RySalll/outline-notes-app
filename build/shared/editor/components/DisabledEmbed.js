"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DisabledEmbed;
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _Widget = _interopRequireDefault(require("./Widget"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function DisabledEmbed(props) {
  return /*#__PURE__*/React.createElement(_Widget.default, {
    title: props.embed.title,
    href: props.href,
    icon: props.embed.icon,
    context: props.href.replace(/^https?:\/\//, ""),
    isSelected: props.isSelected,
    theme: props.theme
  }, /*#__PURE__*/React.createElement(_outlineIcons.OpenIcon, {
    size: 20
  }));
}