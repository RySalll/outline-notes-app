"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "breakpoints", {
  enumerable: true,
  get: function () {
    return _breakpoints.default;
  }
});
Object.defineProperty(exports, "depths", {
  enumerable: true,
  get: function () {
    return _depths.default;
  }
});
exports.truncateMultiline = exports.s = exports.hover = exports.hideScrollbars = exports.extraArea = exports.ellipsis = void 0;
var _browser = require("../utils/browser");
var _depths = _interopRequireDefault(require("./depths"));
var _breakpoints = _interopRequireDefault(require("./breakpoints"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Returns "hover" on a non-touch device and "active" on a touch device. To
 * avoid "sticky" hover on mobile. Use `&:${hover} {...}` instead of
 * using `&:hover {...}`.
 */
const hover = exports.hover = (0, _browser.isTouchDevice)() ? "active" : "hover";

/**
 * Mixin to make text ellipse when it overflows.
 *
 * @returns string of CSS
 */
const ellipsis = () => `
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

/**
 * Mixin to return a theme value.
 *
 * @returns a theme value
 */
exports.ellipsis = ellipsis;
const s = key => props => String(props.theme[key]);

/**
 * Mixin to hide scrollbars.
 *
 * @returns string of CSS
 */
exports.s = s;
const hideScrollbars = () => `
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

/**
 * Mixin on any component with relative positioning to add additional hidden clickable/hoverable area
 *
 * @param pixels
 * @returns
 */
exports.hideScrollbars = hideScrollbars;
const extraArea = pixels => `
  &::before {
    position: absolute;
    content: "";
    top: -${pixels}px;
    right: -${pixels}px;
    left: -${pixels}px;
    bottom: -${pixels}px;
  }
`;

/**
 * Truncate multiline text.
 *
 * @returns string of CSS
 */
exports.extraArea = extraArea;
const truncateMultiline = lines => `
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${lines};
  overflow: hidden;
  overflow-wrap: anywhere;
`;
exports.truncateMultiline = truncateMultiline;