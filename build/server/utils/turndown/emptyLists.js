"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = emptyLists;
/**
 * A turndown plugin for unwrapping top-level empty list items.
 *
 * @param turndownService The TurndownService instance.
 */
function emptyLists(turndownService) {
  turndownService.addRule("empty-lists", {
    filter(node) {
      return node.nodeName === "LI" && node.childNodes.length === 1 && (node.firstChild?.nodeName === "OL" || node.firstChild?.nodeName === "UL");
    },
    replacement(content) {
      return content;
    }
  });
}