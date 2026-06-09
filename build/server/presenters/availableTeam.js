"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentAvailableTeam;
function presentAvailableTeam(team) {
  let isSignedIn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return {
    id: team.id,
    name: team.name,
    avatarUrl: team.avatarUrl,
    url: team.url,
    isSignedIn
  };
}