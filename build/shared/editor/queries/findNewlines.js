"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNextNewline = findNextNewline;
exports.findPreviousNewline = findPreviousNewline;
/**
 * Find the position of the previous newline character.
 *
 * @param $pos The current resolved position
 * @returns The position of the previous newline as an integer, or 0 if there is no previous newline.
 */
function findPreviousNewline($pos) {
  const beginningOfNode = $pos.pos - $pos.parentOffset;

  // The easiest way to find the previous newline is to reverse the string and
  // perform a forward seach as if looking for the next newline.
  const startOfLine = $pos.parent.textContent.split("").reverse().join("").indexOf("\n", $pos.parent.nodeSize - $pos.parentOffset - 2);
  const pos = startOfLine === -1 ? 0 : $pos.parent.nodeSize - startOfLine - 2;
  return beginningOfNode + pos;
}

/**
 * Find the position of the next newline character.
 *
 * @param $pos The current resolved position
 * @returns The position of the next newline as an integer, or the end of the doc if there is no next newline.
 */
function findNextNewline($pos) {
  const beginningOfNode = $pos.pos - $pos.parentOffset;
  const endOfLine = $pos.parent.textContent.indexOf("\n", $pos.parentOffset);
  const pos = endOfLine === -1 ? $pos.parent.nodeSize - 2 : endOfLine;
  return beginningOfNode + pos;
}