"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class TableRow extends _Node.default {
  get name() {
    return "tr";
  }
  get schema() {
    return {
      content: "(th | td)*",
      tableRole: "row",
      parseDOM: [{
        tag: "tr"
      }],
      toDOM() {
        return ["tr", 0];
      }
    };
  }
  toMarkdown() {
    // see: renderTable
  }
  parseMarkdown() {
    return {
      block: "tr"
    };
  }
}
exports.default = TableRow;