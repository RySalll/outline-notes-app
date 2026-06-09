"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentPublicTeam;
var _types = require("./../../shared/types");
function presentPublicTeam(/** The team to present */
team, /** Whether the branding is public */
isBrandingPublic) {
  return {
    ...(isBrandingPublic ? {
      name: team.name,
      avatarUrl: team.avatarUrl,
      customTheme: team.getPreference(_types.TeamPreference.CustomTheme)
    } : {}),
    tocPosition: team.getPreference(_types.TeamPreference.TocPosition)
  };
}