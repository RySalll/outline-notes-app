"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMatchingEmbed = getMatchingEmbed;
function getMatchingEmbed(embeds, href) {
  for (const e of embeds) {
    const matches = e.matcher(href);
    if (matches) {
      return {
        embed: e,
        matches
      };
    }
  }
  return undefined;
}