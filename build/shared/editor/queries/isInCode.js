"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInCode = isInCode;
var _isMarkActive = require("./isMarkActive");
var _isNodeActive = require("./isNodeActive");
/**
 * Returns true if the selection is inside a code block or code mark.
 *
 * @param state The editor state.
 * @param options The options.
 * @returns True if the selection is inside a code block or code mark.
 */
function isInCode(state, options) {
  const {
    nodes,
    marks
  } = state.schema;
  if (!options?.onlyMark) {
    if (nodes.code_block && (0, _isNodeActive.isNodeActive)(nodes.code_block)(state)) {
      return true;
    }
    if (nodes.code_fence && (0, _isNodeActive.isNodeActive)(nodes.code_fence)(state)) {
      return true;
    }
  }
  if (!options?.onlyBlock) {
    if (marks.code_inline) {
      return (0, _isMarkActive.isMarkActive)(marks.code_inline)(state);
    }
  }
  return false;
}