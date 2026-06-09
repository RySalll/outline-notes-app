"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = exports.getEmojisWithCategory = exports.getEmojis = exports.getEmojiVariants = exports.getEmojiId = void 0;
var _data = _interopRequireDefault(require("@emoji-mart/data"));
var _emojiMart = require("emoji-mart");
var _fuzzySearch = _interopRequireDefault(require("fuzzy-search"));
var _capitalize = _interopRequireDefault(require("lodash/capitalize"));
var _sortBy = _interopRequireDefault(require("lodash/sortBy"));
var _types = require("../types");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
(0, _emojiMart.init)({
  data: _data.default
});

// Data has the pre-processed "search" terms.
const TypedData = _emojiMart.Data;

// Slightly modified version of https://github.com/koala-interactive/is-emoji-supported/blob/master/src/is-emoji-supported.ts
const isFlagEmojiSupported = () => {
  const emoji = "🇺🇸";
  let ctx = null;
  try {
    ctx = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true
    });
    if (!ctx) {
      return false;
    }
    const CANVAS_HEIGHT = 25;
    const CANVAS_WIDTH = 20;
    const textSize = Math.floor(CANVAS_HEIGHT / 2);

    // Initialize convas context
    ctx.font = textSize + "px Arial, Sans-Serif";
    ctx.textBaseline = "top";
    ctx.canvas.width = CANVAS_WIDTH * 2;
    ctx.canvas.height = CANVAS_HEIGHT;

    // Draw in red on the left
    ctx.fillStyle = "#FF0000";
    ctx.fillText(emoji, 0, 22);

    // Draw in blue on right
    ctx.fillStyle = "#0000FF";
    ctx.fillText(emoji, CANVAS_WIDTH, 22);
    const a = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
    const count = a.length;
    let i = 0;

    // Search the first visible pixel
    // eslint-disable-next-line curly
    for (; i < count && !a[i + 3]; i += 4);

    // No visible pixel
    if (i >= count) {
      return false;
    }

    // Emoji has immutable color, so we check the color of the emoji in two different colors
    // the result show be the same.
    const x = CANVAS_WIDTH + i / 4 % CANVAS_WIDTH;
    const y = Math.floor(i / 4 / CANVAS_WIDTH);
    const b = ctx.getImageData(x, y, 1, 1).data;
    if (a[i] !== b[0] || a[i + 2] !== b[2]) {
      return false;
    }

    // Some emojis are a contraction of different ones, so if it's not
    // supported, it will show multiple characters
    if (ctx.measureText(emoji).width >= CANVAS_WIDTH) {
      return false;
    }
  } catch {
    return false;
  }

  // Supported
  return true;
};
const allowFlagEmoji = isFlagEmojiSupported();
const flagEmojiIds = TypedData.categories.filter(_ref => {
  let {
    id
  } = _ref;
  return id === _types.EmojiCategory.Flags.toLowerCase();
}).map(_ref2 => {
  let {
    emojis
  } = _ref2;
  return emojis;
})[0] ?? [];
const Categories = allowFlagEmoji ? TypedData.categories : TypedData.categories.filter(_ref3 => {
  let {
    id
  } = _ref3;
  return (0, _capitalize.default)(id) !== _types.EmojiCategory.Flags;
});
const Emojis = allowFlagEmoji ? TypedData.emojis : Object.fromEntries(Object.entries(TypedData.emojis).filter(_ref4 => {
  let [id] = _ref4;
  return !flagEmojiIds.includes(id);
}));
const searcher = new _fuzzySearch.default(Object.values(Emojis), ["search"], {
  caseSensitive: false,
  sort: true
});

// Codes defined by unicode.org
const SKINTONE_CODE_TO_ENUM = {
  "1f3fb": _types.EmojiSkinTone.Light,
  "1f3fc": _types.EmojiSkinTone.MediumLight,
  "1f3fd": _types.EmojiSkinTone.Medium,
  "1f3fe": _types.EmojiSkinTone.MediumDark,
  "1f3ff": _types.EmojiSkinTone.Dark
};
const getVariants = _ref5 => {
  let {
    id,
    name,
    skins
  } = _ref5;
  return skins.reduce((obj, skin) => {
    const skinToneCode = skin.unified.split("-")[1];
    const skinToneType = SKINTONE_CODE_TO_ENUM[skinToneCode] ?? _types.EmojiSkinTone.Default;
    obj[skinToneType] = {
      id,
      name,
      value: skin.native
    };
    return obj;
  }, {});
};
const EMOJI_ID_TO_VARIANTS = Object.entries(Emojis).reduce((obj, _ref6) => {
  let [id, emoji] = _ref6;
  obj[id] = getVariants({
    id,
    name: emoji.name,
    skins: emoji.skins
  });
  return obj;
}, {});
const CATEGORY_TO_EMOJI_IDS = Categories.reduce((obj, _ref7) => {
  let {
    id,
    emojis
  } = _ref7;
  const key = (0, _capitalize.default)(id);
  const category = _types.EmojiCategory[key];
  if (!category) {
    return obj;
  }
  obj[category] = emojis;
  return obj;
}, {});
const getEmojis = _ref8 => {
  let {
    ids,
    skinTone
  } = _ref8;
  return ids.map(id => EMOJI_ID_TO_VARIANTS[id][skinTone] ?? EMOJI_ID_TO_VARIANTS[id][_types.EmojiSkinTone.Default]);
};
exports.getEmojis = getEmojis;
const getEmojisWithCategory = _ref9 => {
  let {
    skinTone
  } = _ref9;
  return Object.keys(CATEGORY_TO_EMOJI_IDS).reduce((obj, category) => {
    const emojiIds = CATEGORY_TO_EMOJI_IDS[category];
    const emojis = emojiIds.map(emojiId => EMOJI_ID_TO_VARIANTS[emojiId][skinTone] ?? EMOJI_ID_TO_VARIANTS[emojiId][_types.EmojiSkinTone.Default]);
    obj[category] = emojis;
    return obj;
  }, {});
};
exports.getEmojisWithCategory = getEmojisWithCategory;
const getEmojiVariants = _ref10 => {
  let {
    id
  } = _ref10;
  return EMOJI_ID_TO_VARIANTS[id];
};
exports.getEmojiVariants = getEmojiVariants;
const search = _ref11 => {
  let {
    query,
    skinTone
  } = _ref11;
  const queryLowercase = query.toLowerCase();
  const emojiSkinTone = skinTone ?? _types.EmojiSkinTone.Default;
  const matchedEmojis = searcher.search(queryLowercase).map(emoji => EMOJI_ID_TO_VARIANTS[emoji.id][emojiSkinTone] ?? EMOJI_ID_TO_VARIANTS[emoji.id][_types.EmojiSkinTone.Default]);
  return (0, _sortBy.default)(matchedEmojis, emoji => {
    const nlc = emoji.name.toLowerCase();
    return query === nlc ? -1 : nlc.startsWith(queryLowercase) ? 0 : 1;
  });
};

/**
 * Get am emoji's human-readable ID from its string.
 *
 * @param emoji - The string representation of the emoji.
 * @returns The emoji id, if found.
 */
exports.search = search;
const getEmojiId = emoji => searcher.search(emoji)[0]?.id;
exports.getEmojiId = getEmojiId;