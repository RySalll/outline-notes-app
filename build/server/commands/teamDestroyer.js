"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = teamDestroyer;
var _models = require("./../models");
async function teamDestroyer(_ref) {
  let {
    user,
    team,
    ip,
    transaction
  } = _ref;
  await _models.Event.create({
    name: "teams.delete",
    actorId: user.id,
    teamId: team.id,
    data: {
      name: team.name
    },
    ip
  }, {
    transaction
  });
  return team.destroy({
    transaction
  });
}