"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = underlines;
/**
 * A turndown plugin for converting u tags to underlines.
 *
 * @param turndownService The TurndownService instance.
 */
function underlines(turndownService) {
  turndownService.addRule("underlines", {
    filter: ["u"],
    replacement(content) {
      return `__${content.trim()}__`;
    }
  });
}