"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collapseSelection = void 0;
var _prosemirrorState = require("prosemirror-state");
/**
 * A prosemirror command to collapse the current selection to a cursor at the start of the selection.
 *
 * @returns A prosemirror command.
 */
const collapseSelection = () => (state, dispatch) => {
  dispatch?.(state.tr.setSelection(_prosemirrorState.TextSelection.create(state.doc, state.tr.selection.from)));
  return true;
};
exports.collapseSelection = collapseSelection;