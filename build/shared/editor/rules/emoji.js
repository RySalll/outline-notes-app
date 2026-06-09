"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = emoji;
var _markdownItEmoji = _interopRequireDefault(require("markdown-it-emoji"));
var _emoji = require("../lib/emoji");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function emoji(md) {
  // Ideally this would be an empty object, but due to a bug in markdown-it-emoji
  // passing an empty object results in newlines becoming emojis. Until this is
  // fixed at least one key is required. See:
  // https://github.com/markdown-it/markdown-it-emoji/issues/46
  const noMapping = {
    no_name_mapping: "💯"
  };
  return (0, _markdownItEmoji.default)(md, {
    defs: md.options.emoji === false ? noMapping : _emoji.nameToEmoji,
    shortcuts: {}
  });
}