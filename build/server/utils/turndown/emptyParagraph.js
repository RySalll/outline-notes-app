"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = emptyParagraphs;
/**
 * A turndown plugin for converting paragraphs with only breaks to newlines.
 *
 * @param turndownService The TurndownService instance.
 */
function emptyParagraphs(turndownService) {
  turndownService.addRule("emptyParagraphs", {
    filter(node) {
      return node.nodeName === "P" && node.children.length === 1 && node.textContent?.trim() === "" && node.children[0].nodeName === "BR";
    },
    replacement() {
      return "\n\n\\\n";
    }
  });
}