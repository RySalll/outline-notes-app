"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const parseMentionUrl = url => {
  const matches = url.match(/^mention:\/\/([a-z0-9-]+)\/([a-z]+)\/([a-z0-9-]+)$/);
  if (!matches) {
    return {};
  }
  const [id, mentionType, modelId] = matches.slice(1);
  return {
    id,
    mentionType,
    modelId
  };
};
var _default = exports.default = parseMentionUrl;