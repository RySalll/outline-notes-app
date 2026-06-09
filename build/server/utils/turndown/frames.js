"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = images;
/**
 * A turndown plugin to convert iframes to markdown links.
 *
 * @param turndownService The TurndownService instance.
 */
function images(turndownService) {
  turndownService.addRule("frames", {
    filter: "iframe",
    replacement(content, node) {
      const src = (node.getAttribute("src") || "").replace(/\n+/g, "");
      const title = cleanAttribute(node.getAttribute("title") || "");
      return src ? "[" + (title || src) + "]" + "(" + src + ")" : "";
    }
  });
}
function cleanAttribute(attribute) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, "\n") : "";
}