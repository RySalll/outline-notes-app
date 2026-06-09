"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.snakeCase = exports.nameToEmoji = exports.getNameFromEmoji = exports.getEmojiFromName = exports.emojiMartToGemoji = void 0;
var _data = _interopRequireDefault(require("@emoji-mart/data"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const emojiMartToGemoji = exports.emojiMartToGemoji = {
  "+1": "thumbs_up",
  "-1": "thumbs_down"
};

/**
 * Convert kebab case to snake case.
 *
 * @param str The string to convert
 * @returns The converted string
 */
const snakeCase = str => str.replace(/(\w)-(\w)/g, "$1_$2");

/**
 * A map of emoji shortcode to emoji character. The shortcode is snake cased
 * for backwards compatibility with those already encoded into documents.
 */
exports.snakeCase = snakeCase;
const nameToEmoji = exports.nameToEmoji = Object.values(_data.default.emojis).reduce((acc, emoji) => {
  const convertedId = snakeCase(emoji.id);
  // @ts-expect-error emojiMartToGemoji is a valid map
  acc[emojiMartToGemoji[convertedId] ?? convertedId] = emoji.skins[0].native;
  return acc;
}, {});

/**
 * Get the emoji character for a given emoji shortcode.
 *
 * @param name The emoji shortcode
 * @returns The emoji character
 */
const getEmojiFromName = name => nameToEmoji[name.replace(/:/g, "")] ?? "?";

/**
 * Get the emoji shortcode for a given emoji character.
 *
 * @param emoji The emoji character
 * @returns The emoji shortcode
 */
exports.getEmojiFromName = getEmojiFromName;
const getNameFromEmoji = emoji => Object.entries(nameToEmoji).find(_ref => {
  let [, value] = _ref;
  return value === emoji;
})?.[0];
exports.getNameFromEmoji = getNameFromEmoji;