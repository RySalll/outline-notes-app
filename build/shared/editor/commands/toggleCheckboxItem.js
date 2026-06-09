"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toggleCheckboxItem;
var _findParentNode = require("../queries/findParentNode");
/**
 * A prosemirror command to toggle the checkbox item at the current selection.
 *
 * @returns A prosemirror command.
 */
function toggleCheckboxItem() {
  return (state, dispatch) => {
    const {
      empty
    } = state.selection;

    // if the selection has anything in it then use standard behavior
    if (!empty) {
      return false;
    }

    // check we're in a matching node
    const listItem = (0, _findParentNode.findParentNode)(node => node.type === state.schema.nodes.checkbox_item)(state.selection);
    if (!listItem) {
      return false;
    }
    dispatch?.(state.tr.setNodeMarkup(listItem.pos, undefined, {
      checked: !listItem.node.attrs.checked
    }));
    return true;
  };
}