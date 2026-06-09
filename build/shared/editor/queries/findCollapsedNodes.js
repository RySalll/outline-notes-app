"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findCollapsedNodes = findCollapsedNodes;
var _findChildren = require("./findChildren");
function findCollapsedNodes(doc) {
  const blocks = (0, _findChildren.findBlockNodes)(doc);
  const nodes = [];
  const collapsedStack = [];
  for (const block of blocks) {
    if (collapsedStack.length) {
      const top = collapsedStack[collapsedStack.length - 1];
      // if the block encountered same or higher level heading, pop the stack
      if (block.node.type.name === "heading" && block.node.attrs.level <= top) {
        collapsedStack.pop();

        // if the block is a heading and it is collapsed, push it to the stack
        if (block.node.attrs.collapsed) {
          collapsedStack.push(block.node.attrs.level);
        }
      } else {
        // the deepest level or non-heading block should be added to the nodes
        nodes.push(block);
      }
    } else {
      if (block.node.type.name === "heading" && block.node.attrs.collapsed) {
        collapsedStack.push(block.node.attrs.level);
      }
    }
  }
  return nodes;
}