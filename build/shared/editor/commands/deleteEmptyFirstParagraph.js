"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isNodeActive = require("../queries/isNodeActive");
/**
 * Deletes the first paragraph node if it is empty and the cursor is at the
 * beginning of the document.
 */
const deleteEmptyFirstParagraph = (state, dispatch) => {
  if (!(0, _isNodeActive.isNodeActive)(state.schema.nodes.paragraph)(state)) {
    return false;
  }
  if (state.selection.from !== 1 || state.selection.to !== 1) {
    return false;
  }
  const parent = state.selection.$from.parent;
  if (parent.textContent !== "" || parent.childCount > 0) {
    return false;
  }

  // delete the empty paragraph node
  dispatch?.(state.tr.delete(state.selection.from - 1, state.selection.from).scrollIntoView());
  return true;
};
var _default = exports.default = deleteEmptyFirstParagraph;