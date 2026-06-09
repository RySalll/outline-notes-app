"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectAll = selectAll;
var _prosemirrorState = require("prosemirror-state");
var _findParentNode = require("../queries/findParentNode");
/**
 * Selects all the content of the given node type.
 *
 * @param type The node type
 * @returns A prosemirror command.
 */
function selectAll(type) {
  return (state, dispatch) => {
    const code = (0, _findParentNode.findParentNode)(node => node.type === type)(state.selection);
    if (code) {
      const start = code.pos;
      const end = code.pos + code.node.nodeSize;
      if (start === state.selection.from - 1 && end === state.selection.to + 1) {
        return false;
      }
      dispatch?.(state.tr.setSelection(_prosemirrorState.TextSelection.between(state.doc.resolve(start), state.doc.resolve(end))));
      return true;
    }
    return false;
  };
}