"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styledComponentsBreakpoint = _interopRequireDefault(require("styled-components-breakpoint"));
var _styles = require("../../styles");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * A component that renders a caption for an image or video.
 */
function Caption(_ref) {
  let {
    placeholder,
    children,
    isSelected,
    width,
    ...rest
  } = _ref;
  const handlePaste = event => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    window.document.execCommand("insertText", false, text);
  };
  const handleMouseDown = ev => {
    // always prevent clicks in caption from bubbling to the editor
    ev.stopPropagation();
  };
  return /*#__PURE__*/React.createElement(Content, _extends({
    $width: width,
    $isSelected: isSelected,
    onMouseDown: handleMouseDown,
    onPaste: handlePaste,
    className: "caption",
    tabIndex: -1,
    role: "textbox",
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-caption": placeholder
  }, rest), children);
}
const Content = _styledComponents.default.p`
  border: 0;
  display: block;
  font-style: italic;
  font-weight: normal;
  color: ${(0, _styles.s)("textSecondary")};
  padding: 8px 0 4px;
  line-height: 16px;
  text-align: center;
  min-height: 1em;
  outline: none;
  background: none;
  resize: none;
  user-select: text;
  margin: 0 auto !important;
  cursor: text;
  width: ${props => props.$width}px;
  min-width: 200px;

  ${(0, _styledComponentsBreakpoint.default)("tablet")`
    font-size: 13px;
  `};

  &:empty:not(:focus) {
    display: ${props => props.$isSelected ? "block" : "none"}};
  }

  &:empty:before {
    color: ${(0, _styles.s)("placeholder")};
    content: attr(data-caption);
    pointer-events: none;

    @media print {
      display: none;
    }
  }
`;
var _default = exports.default = Caption;