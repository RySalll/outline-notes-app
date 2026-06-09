"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = underlines;
/**
 * A turndown plugin for converting anchors to inline links without a title.
 *
 * @param turndownService The TurndownService instance.
 */
function underlines(turndownService) {
  turndownService.addRule("inlineLink", {
    filter(node, options) {
      return !!(options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href"));
    },
    replacement(content, node) {
      const href = node.getAttribute("href");
      return "[" + content + "](" + href + ")";
    }
  });
}