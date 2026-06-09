"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IconTitleWrapper = void 0;
var _mobxReact = require("mobx-react");
var _polished = require("polished");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _useStores = _interopRequireDefault(require("../hooks/useStores"));
var _types = require("../types");
var _IconLibrary = require("../utils/IconLibrary");
var _collections = require("../utils/collections");
var _icon = require("../utils/icon");
var _EmojiIcon = _interopRequireDefault(require("./EmojiIcon"));
var _Flex = _interopRequireDefault(require("./Flex"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// import Logger from "~/utils/Logger";

const Icon = _ref => {
  let {
    value: icon,
    color,
    size = 24,
    initial,
    forceColor,
    className
  } = _ref;
  const iconType = (0, _icon.determineIconType)(icon);
  if (!iconType) {
    // Logger.warn("Failed to determine icon type", {
    //   icon,
    // });
    return null;
  }
  try {
    if (iconType === _types.IconType.SVG) {
      return /*#__PURE__*/React.createElement(SVGIcon, {
        value: icon,
        color: color,
        size: size,
        initial: initial,
        className: className,
        forceColor: forceColor
      });
    }
    return /*#__PURE__*/React.createElement(_EmojiIcon.default, {
      emoji: icon,
      size: size,
      className: className
    });
  } catch (err) {
    // Logger.warn("Failed to render icon", {
    //   icon,
    // });
  }
  return null;
};
const SVGIcon = (0, _mobxReact.observer)(_ref2 => {
  let {
    value: icon,
    color: inputColor,
    initial,
    size,
    className,
    forceColor
  } = _ref2;
  const {
    ui
  } = (0, _useStores.default)();
  let color = inputColor ?? _collections.colorPalette[0];

  // If the chosen icon color is very dark then we invert it in dark mode
  if (!forceColor) {
    if (ui.resolvedTheme === "dark" && color !== "currentColor") {
      color = (0, _polished.getLuminance)(color) > 0.09 ? color : "currentColor";
    }

    // If the chosen icon color is very light then we invert it in light mode
    if (ui.resolvedTheme === "light" && color !== "currentColor") {
      color = (0, _polished.getLuminance)(color) < 0.9 ? color : "currentColor";
    }
  }
  const Component = _IconLibrary.IconLibrary.getComponent(icon);
  return /*#__PURE__*/React.createElement(Component, {
    color: color,
    size: size,
    className: className
  }, initial);
});
const IconTitleWrapper = exports.IconTitleWrapper = (0, _styledComponents.default)(_Flex.default)`
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 3px;
  height: 40px;
  width: 40px;

  // Always move above TOC
  z-index: 1;

  ${props => props.dir === "rtl" ? "right: -44px" : "left: -44px"};
`;
var _default = exports.default = Icon;