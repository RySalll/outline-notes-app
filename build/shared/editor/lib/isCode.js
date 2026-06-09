"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isCode = isCode;
function isCode(node) {
  return node.type.name === "code_block" || node.type.name === "code_fence";
}