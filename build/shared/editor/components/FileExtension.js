"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FileExtension;
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
var _color = require("../../utils/color");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function FileExtension(props) {
  const parts = (props.title ?? "Unknown").split(".");
  const extension = parts.length > 1 ? parts.pop() : undefined;
  return /*#__PURE__*/React.createElement(Icon, {
    style: {
      background: (0, _color.stringToColor)(extension || "")
    },
    $size: props.size || 28
  }, extension ? /*#__PURE__*/React.createElement("span", null, extension?.slice(0, 4)) : /*#__PURE__*/React.createElement(_outlineIcons.AttachmentIcon, null));
}
const Icon = _styledComponents.default.span`
  font-family: ${(0, _styles.s)("fontFamilyMono")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  text-transform: uppercase;
  color: white;
  text-align: center;
  border-radius: 4px;

  min-width: ${props => props.$size}px;
  height: ${props => props.$size}px;
`;