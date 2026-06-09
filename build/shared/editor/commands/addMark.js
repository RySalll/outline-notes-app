"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMark = void 0;
/**
 * A prosemirror command to create a mark at the current selection.
 *
 * @returns A prosemirror command.
 */
const addMark = (type, attrs) => (state, dispatch) => {
  dispatch?.(state.tr.addMark(state.selection.from, state.selection.to, type.create(attrs)));
  return true;
};
exports.addMark = addMark;