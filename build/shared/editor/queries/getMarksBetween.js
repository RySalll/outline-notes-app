"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMarksBetween = getMarksBetween;
/**
 * Get all marks that are applied to text between two positions.
 *
 * @param start The start position
 * @param end The end position
 * @param state The editor state
 * @returns A list of marks
 */
function getMarksBetween(start, end, state) {
  let marks = [];
  state.doc.nodesBetween(start, end, (node, pos) => {
    marks = [...marks, ...node.marks.map(mark => ({
      start: pos,
      end: pos + node.nodeSize,
      mark
    }))];
  });
  return marks;
}