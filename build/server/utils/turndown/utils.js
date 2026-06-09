"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inHtmlContext = inHtmlContext;
function inHtmlContext(node, selector) {
  let currentNode = node;
  // start at the closest element
  while (currentNode !== null && currentNode.nodeType !== 1) {
    currentNode = currentNode.parentElement || currentNode.parentNode;
  }
  return currentNode !== null && currentNode.nodeType === 1 && currentNode.closest(selector) !== null;
}