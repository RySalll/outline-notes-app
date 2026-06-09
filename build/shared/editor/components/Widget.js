"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Widget;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _styles = require("../../styles");
var _urls = require("../../utils/urls");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Widget(props) {
  const className = props.isSelected ? "ProseMirror-selectednode widget" : "widget";
  return /*#__PURE__*/React.createElement(Wrapper, {
    className: className,
    target: "_blank",
    href: (0, _urls.sanitizeUrl)(props.href),
    rel: "noreferrer nofollow",
    onDoubleClick: props.onDoubleClick,
    onMouseDown: props.onMouseDown,
    onClick: props.onClick
  }, props.icon, /*#__PURE__*/React.createElement(Preview, null, /*#__PURE__*/React.createElement(Title, null, props.title), /*#__PURE__*/React.createElement(Subtitle, null, props.context), /*#__PURE__*/React.createElement(Children, null, props.children)));
}
const Children = _styledComponents.default.div`
  margin-left: auto;
  height: 20px;
  opacity: 0;

  &:hover {
    color: ${(0, _styles.s)("text")};
  }
`;
const Title = _styledComponents.default.strong`
  font-weight: 500;
  font-size: 14px;
  color: ${(0, _styles.s)("text")};
`;
const Preview = _styledComponents.default.div`
  gap: 8px;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  align-items: center;
  color: ${(0, _styles.s)("textTertiary")};
`;
const Subtitle = _styledComponents.default.span`
  font-size: 13px;
  color: ${(0, _styles.s)("textTertiary")} !important;
  line-height: 0;
`;
const Wrapper = _styledComponents.default.a`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${(0, _styles.s)("background")};
  color: ${(0, _styles.s)("text")} !important;
  box-shadow: 0 0 0 1px ${(0, _styles.s)("divider")};
  white-space: nowrap;
  border-radius: 8px;
  padding: 6px 8px;
  max-width: 840px;
  cursor: default;

  user-select: none;
  text-overflow: ellipsis;
  overflow: hidden;

  ${props => props.href && (0, _styledComponents.css)`
      &:hover,
      &:active {
        cursor: pointer !important;
        text-decoration: none !important;
        background: ${(0, _styles.s)("backgroundSecondary")};

        ${Children} {
          opacity: 1;
        }
      }
    `}
`;