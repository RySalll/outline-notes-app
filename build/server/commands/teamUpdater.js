"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _has = _interopRequireDefault(require("lodash/has"));
var _types = require("./../../shared/types");
var _env = _interopRequireDefault(require("./../env"));
var _models = require("./../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const teamUpdater = async _ref => {
  let {
    params,
    user,
    team,
    ip,
    transaction
  } = _ref;
  const {
    allowedDomains,
    preferences,
    subdomain,
    ...attributes
  } = params;
  team.setAttributes(attributes);
  if (subdomain !== undefined && _env.default.isCloudHosted) {
    team.subdomain = subdomain === "" ? null : subdomain;
  }
  if (allowedDomains !== undefined) {
    const existingAllowedDomains = await _models.TeamDomain.findAll({
      where: {
        teamId: team.id
      },
      transaction
    });

    // Only keep existing domains if they are still in the list of allowed domains
    const newAllowedDomains = team.allowedDomains.filter(existingTeamDomain => allowedDomains.includes(existingTeamDomain.name));

    // Add new domains
    const existingDomains = team.allowedDomains.map(x => x.name);
    const newDomains = allowedDomains.filter(newDomain => newDomain !== "" && !existingDomains.includes(newDomain));
    await Promise.all(newDomains.map(async newDomain => {
      newAllowedDomains.push(await _models.TeamDomain.create({
        name: newDomain,
        teamId: team.id,
        createdById: user.id
      }, {
        transaction
      }));
    }));

    // Destroy the existing TeamDomains that were removed
    const deletedDomains = existingAllowedDomains.filter(x => !allowedDomains.includes(x.name));
    await Promise.all(deletedDomains.map(x => x.destroy({
      transaction
    })));
    team.allowedDomains = newAllowedDomains;
  }
  if (preferences) {
    for (const value of Object.values(_types.TeamPreference)) {
      if ((0, _has.default)(preferences, value)) {
        team.setPreference(value, preferences[value]);
      }
    }
  }
  const changes = team.changeset;
  if (Object.keys(changes.attributes).length) {
    await _models.Event.create({
      name: "teams.update",
      actorId: user.id,
      teamId: user.teamId,
      ip,
      changes
    }, {
      transaction
    });
  }
  return team.save({
    transaction
  });
};
var _default = exports.default = teamUpdater;