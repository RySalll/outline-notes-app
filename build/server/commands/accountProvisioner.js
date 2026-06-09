"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = require("fs-extra");
var _invariant = _interopRequireDefault(require("invariant"));
var _types = require("./../../shared/types");
var _WelcomeEmail = _interopRequireDefault(require("./../emails/templates/WelcomeEmail"));
var _env = _interopRequireDefault(require("./../env"));
var _errors = require("./../errors");
var _tracing = require("./../logging/tracing");
var _models = require("./../models");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
var _database = require("./../storage/database");
var _teamProvisioner = _interopRequireDefault(require("./teamProvisioner"));
var _userProvisioner = _interopRequireDefault(require("./userProvisioner"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function accountProvisioner(_ref) {
  let {
    ip,
    user: userParams,
    team: teamParams,
    authenticationProvider: authenticationProviderParams,
    authentication: authenticationParams
  } = _ref;
  let result;
  let emailMatchOnly;
  try {
    result = await (0, _teamProvisioner.default)({
      ...teamParams,
      authenticationProvider: authenticationProviderParams,
      ip
    });
  } catch (err) {
    // The account could not be provisioned for the provided teamId
    // check to see if we can try authentication using email matching only
    if (err.id === "invalid_authentication") {
      const authenticationProvider = await _models.AuthenticationProvider.findOne({
        where: {
          name: authenticationProviderParams.name,
          // example: "google"
          teamId: teamParams.teamId
        },
        include: [{
          model: _models.Team,
          as: "team",
          required: true
        }]
      });
      if (authenticationProvider) {
        emailMatchOnly = true;
        result = {
          authenticationProvider,
          team: authenticationProvider.team,
          isNewTeam: false
        };
      }
    }
    if (!result) {
      if (err.id) {
        throw err;
      } else {
        throw (0, _errors.InvalidAuthenticationError)(err.message);
      }
    }
  }
  (0, _invariant.default)(result, "Team creator result must exist");
  const {
    authenticationProvider,
    team,
    isNewTeam
  } = result;
  if (!authenticationProvider.enabled) {
    throw (0, _errors.AuthenticationProviderDisabledError)();
  }
  result = await (0, _userProvisioner.default)({
    name: userParams.name,
    email: userParams.email,
    language: userParams.language,
    role: isNewTeam ? _types.UserRole.Admin : undefined,
    avatarUrl: userParams.avatarUrl,
    teamId: team.id,
    ip,
    authentication: emailMatchOnly ? undefined : {
      authenticationProviderId: authenticationProvider.id,
      ...authenticationParams,
      expiresAt: authenticationParams.expiresIn ? new Date(Date.now() + authenticationParams.expiresIn * 1000) : undefined
    }
  });
  const {
    isNewUser,
    user
  } = result;

  // TODO: Move to processor
  if (isNewUser) {
    await new _WelcomeEmail.default({
      to: user.email,
      role: user.role,
      teamUrl: team.url
    }).schedule();
  }
  if (isNewUser || isNewTeam) {
    let provision = isNewTeam;

    // accounts for the case where a team is provisioned, but the user creation
    // failed. In this case we have a valid previously created team but no
    // onboarding collection.
    if (!isNewTeam) {
      const count = await _models.Collection.count({
        where: {
          teamId: team.id
        }
      });
      provision = count === 0;
    }
    if (provision) {
      await provisionFirstCollection(team, user);
    }
  }
  return {
    user,
    team,
    isNewUser,
    isNewTeam
  };
}
async function provisionFirstCollection(team, user) {
  await _database.sequelize.transaction(async transaction => {
    const collection = await _models.Collection.create({
      name: "Welcome",
      description: `This collection is a quick guide to what ${_env.default.APP_NAME} is all about. Feel free to delete this collection once your team is up to speed with the basics!`,
      teamId: team.id,
      createdById: user.id,
      sort: _models.Collection.DEFAULT_SORT,
      permission: _types.CollectionPermission.ReadWrite
    }, {
      transaction
    });

    // For the first collection we go ahead and create some initial documents to get
    // the team started. You can edit these in /server/onboarding/x.md
    const onboardingDocs = ["Integrations & API", "Our Editor", "Getting Started", "What is Outline"];
    for (const title of onboardingDocs) {
      const text = await (0, _fsExtra.readFile)(_path.default.join(process.cwd(), "server", "onboarding", `${title}.md`), "utf8");
      const document = await _models.Document.create({
        version: 2,
        isWelcome: true,
        parentDocumentId: null,
        collectionId: collection.id,
        teamId: collection.teamId,
        lastModifiedById: collection.createdById,
        createdById: collection.createdById,
        title,
        text
      }, {
        transaction
      });
      document.content = await _DocumentHelper.DocumentHelper.toJSON(document);
      await document.publish(user, collection.id, {
        silent: true,
        transaction
      });
    }
  });
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "accountProvisioner"
})(accountProvisioner);