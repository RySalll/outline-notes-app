"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _styledComponents = _interopRequireDefault(require("styled-components"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Flex = _styledComponents.default.div`
  display: flex;
  flex: ${_ref => {
  let {
    auto
  } = _ref;
  return auto ? "1 1 auto" : "initial";
}};
  flex-direction: ${_ref2 => {
  let {
    column,
    reverse
  } = _ref2;
  return reverse ? column ? "column-reverse" : "row-reverse" : column ? "column" : "row";
}};
  align-items: ${_ref3 => {
  let {
    align
  } = _ref3;
  return align;
}};
  justify-content: ${_ref4 => {
  let {
    justify
  } = _ref4;
  return justify;
}};
  flex-wrap: ${_ref5 => {
  let {
    wrap
  } = _ref5;
  return wrap ? "wrap" : "initial";
}};
  flex-shrink: ${_ref6 => {
  let {
    shrink
  } = _ref6;
  return shrink === true ? 1 : shrink === false ? 0 : "initial";
}};
  gap: ${_ref7 => {
  let {
    gap
  } = _ref7;
  return gap ? `${gap}px` : "initial";
}};
  min-height: 0;
  min-width: 0;
`;
var _default = exports.default = Flex;