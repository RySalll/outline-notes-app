"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizeRight = exports.ResizeLeft = exports.ResizeBottom = void 0;
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const ResizeLeft = exports.ResizeLeft = _styledComponents.default.div`
  cursor: ew-resize;
  position: absolute;
  left: -4px;
  top: 30%;
  bottom: 30%;
  width: 8px;
  user-select: none;
  opacity: ${props => props.$dragging ? 1 : 0};
  transition: opacity 150ms ease-in-out;

  &:after {
    content: "";
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 25%;
    min-height: 20px;
    border-radius: 4px;
    background: ${(0, _styles.s)("menuBackground")};
    box-shadow: 0 0 0 1px ${(0, _styles.s)("textSecondary")};
    opacity: 0.75;
  }

  @media print {
    display: none;
  }
`;
const ResizeRight = exports.ResizeRight = (0, _styledComponents.default)(ResizeLeft)`
  left: initial;
  right: -4px;

  &:after {
    left: initial;
    right: 8px;
  }
`;
const ResizeBottom = exports.ResizeBottom = (0, _styledComponents.default)(ResizeLeft)`
  cursor: ns-resize;
  left: 30%;
  right: 30%;
  top: initial;
  bottom: 8px;
  width: auto;
  height: 8px;

  &:after {
    left: 50%;
    bottom: 8px;
    transform: translateX(-50%);
    width: 25%;
    height: 6px;
    min-width: 20px;
    min-height: 0;
  }
`;