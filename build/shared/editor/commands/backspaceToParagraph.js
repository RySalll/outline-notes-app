"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = backspaceToParagraph;
/**
 * Converts the current node to a paragraph when pressing backspace at the
 * beginning of the node and not already a paragraph.
 *
 * @param type The node type
 * @returns A prosemirror command.
 */
function backspaceToParagraph(type) {
  return (state, dispatch, view) => {
    const {
      $from,
      from,
      to,
      empty
    } = state.selection;

    // if the selection has anything in it then use standard delete behavior
    if (!empty) {
      return false;
    }

    // check we're in a matching node
    if ($from.parent.type !== type) {
      return false;
    }

    // check if we're at the beginning of the heading
    if (!view?.endOfTextblock("backward", state)) {
      return false;
    }

    // okay, replace it with a paragraph
    dispatch?.(state.tr.setBlockType(from, to, type.schema.nodes.paragraph).scrollIntoView());
    return true;
  };
}