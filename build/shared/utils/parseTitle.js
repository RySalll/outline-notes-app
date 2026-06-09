"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseTitle;
var _emojiRegex = _interopRequireDefault(require("emoji-regex"));
var _markdown = require("./markdown");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function parseTitle() {
  let text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  const regex = (0, _emojiRegex.default)();

  // find and extract title
  const firstLine = text.trim().split(/\r?\n/)[0];
  const title = (0, _markdown.unescape)(firstLine.replace(/^#/, "").trim());

  // find and extract first emoji
  const matches = regex.exec(title);
  const firstEmoji = matches ? matches[0] : null;
  const startsWithEmoji = firstEmoji && title.startsWith(firstEmoji);
  const emoji = startsWithEmoji ? firstEmoji : undefined;

  // title with first leading emoji stripped
  const strippedTitle = startsWithEmoji ? title.replace(firstEmoji, "").trim() : title;
  return {
    title,
    emoji,
    strippedTitle
  };
}