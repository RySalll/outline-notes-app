"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getParentListItem = getParentListItem;
function getParentListItem(state) {
  const $head = state.selection.$head;
  for (let d = $head.depth; d > 0; d--) {
    const node = $head.node(d);
    if (["list_item", "checkbox_item"].includes(node.type.name)) {
      return [node, $head.before(d)];
    }
  }
}