"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = notice;
var _markdownItContainer = _interopRequireDefault(require("markdown-it-container"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function notice(md) {
  return (0, _markdownItContainer.default)(md, "notice", {
    marker: ":",
    validate: () => true,
    render(tokens, idx) {
      const {
        info
      } = tokens[idx];
      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<div class="notice notice-${md.utils.escapeHtml(info)}">\n`;
      } else {
        // closing tag
        return "</div>\n";
      }
    }
  });
}