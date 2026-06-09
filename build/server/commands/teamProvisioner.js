"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _teamCreator = _interopRequireDefault(require("./teamCreator"));
var _env = _interopRequireDefault(require("./../env"));
var _errors = require("./../errors");
var _tracing = require("./../logging/tracing");
var _models = require("./../models");
var _database = require("./../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function teamProvisioner(_ref) {
  let {
    teamId,
    name,
    domain,
    subdomain,
    avatarUrl,
    authenticationProvider,
    ip
  } = _ref;
  let authP = await _models.AuthenticationProvider.findOne({
    where: teamId ? {
      ...authenticationProvider,
      teamId
    } : authenticationProvider,
    include: [{
      model: _models.Team,
      as: "team",
      required: true,
      paranoid: false
    }]
  });

  // This authentication provider already exists which means we have a team and
  // there is nothing left to do but return the existing credentials
  if (authP) {
    if (authP.team.deletedAt) {
      throw (0, _errors.TeamPendingDeletionError)();
    }
    return {
      authenticationProvider: authP,
      team: authP.team,
      isNewTeam: false
    };
  } else if (teamId) {
    // The user is attempting to log into a team with an unfamiliar SSO provider
    if (_env.default.isCloudHosted) {
      throw (0, _errors.InvalidAuthenticationError)();
    }

    // This team + auth provider combination has not been seen before in self hosted
    const team = await _models.Team.findByPk(teamId, {
      rejectOnEmpty: true
    });

    // If the self-hosted installation has a single team and the domain for the
    // new team is allowed then assign the authentication provider to the
    // existing team
    if (domain) {
      if (await team.isDomainAllowed(domain)) {
        authP = await team.$create("authenticationProvider", authenticationProvider);
        return {
          authenticationProvider: authP,
          team,
          isNewTeam: false
        };
      }
      throw (0, _errors.DomainNotAllowedError)();
    }
    throw (0, _errors.InvalidAuthenticationError)();
  }

  // We cannot find an existing team, so we create a new one
  const team = await _database.sequelize.transaction(transaction => (0, _teamCreator.default)({
    name,
    domain,
    subdomain,
    avatarUrl,
    authenticationProviders: [authenticationProvider],
    ip,
    transaction
  }));
  return {
    team,
    authenticationProvider: team.authenticationProviders[0],
    isNewTeam: true
  };
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "teamProvisioner"
})(teamProvisioner);