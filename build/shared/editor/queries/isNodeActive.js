"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNodeActive = void 0;
var _findParentNode = require("./findParentNode");
/**
 * Checks if a node is active in the current selection or not.
 *
 * @param type The node type to check.
 * @param attrs The attributes to check.
 * @returns A function that checks if a node is active in the current selection or not.
 */
const isNodeActive = function (type) {
  let attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return state => {
    if (!type) {
      return false;
    }
    const nodeAfter = state.selection.$from.nodeAfter;
    let node = nodeAfter?.type === type ? nodeAfter : undefined;
    if (!node) {
      const parent = (0, _findParentNode.findParentNode)(n => n.type === type)(state.selection);
      node = parent?.node;
    }
    if (!Object.keys(attrs).length || !node) {
      return !!node;
    }
    return node.hasMarkup(type, {
      ...node.attrs,
      ...attrs
    });
  };
};
exports.isNodeActive = isNodeActive;