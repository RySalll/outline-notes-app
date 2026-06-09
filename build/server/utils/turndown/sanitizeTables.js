"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sanitizeTables;
var _utils = require("./utils");
/**
 * A turndown plugin for removing incompatible nodes from tables.
 *
 * @param turndownService The TurndownService instance.
 */
function sanitizeTables(turndownService) {
  turndownService.addRule("headingsInTables", {
    filter(node) {
      return ["H1", "H2", "H3", "H4", "H5", "H6"].includes(node.nodeName) && (0, _utils.inHtmlContext)(node, "table");
    },
    replacement(content) {
      return `**${content.trim()}**`;
    }
  });
  turndownService.addRule("paragraphsInCells", {
    filter(node) {
      return node.nodeName === "P" && (0, _utils.inHtmlContext)(node, "table");
    },
    replacement(content, node) {
      return content.trim() + (node.nextSibling ? "\\n" : "");
    }
  });
}