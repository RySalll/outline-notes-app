"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = breaks;
/**
 * A turndown plugin for converting break tags to newlines.
 *
 * @param turndownService The TurndownService instance.
 */
function breaks(turndownService) {
  turndownService.addRule("breaks", {
    filter: ["br"],
    replacement() {
      return "\\n";
    }
  });
}