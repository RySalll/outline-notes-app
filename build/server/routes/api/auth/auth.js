"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _uniqBy = _interopRequireDefault(require("lodash/uniqBy"));
var _types = require("./../../../../shared/types");
var _domains = require("./../../../../shared/utils/domains");
var _env = _interopRequireDefault(require("./../../../env"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _models = require("./../../../models");
var _AuthenticationHelper = _interopRequireDefault(require("./../../../models/helpers/AuthenticationHelper"));
var _presenters = require("./../../../presenters");
var _ValidateSSOAccessTask = _interopRequireDefault(require("./../../../queues/tasks/ValidateSSOAccessTask"));
var _authentication2 = require("./../../../utils/authentication");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("auth.config", async ctx => {
  // If self hosted AND there is only one team then that team becomes the
  // brand for the knowledge base and it's guest signin option is used for the
  // root login page.
  if (!_env.default.isCloudHosted) {
    const team = await _models.Team.scope("withAuthenticationProviders").findOne({
      order: [["createdAt", "DESC"]]
    });
    if (team) {
      ctx.body = {
        data: {
          name: team.name,
          customTheme: team.getPreference(_types.TeamPreference.CustomTheme),
          logo: team.getPreference(_types.TeamPreference.PublicBranding) ? team.avatarUrl : undefined,
          providers: _AuthenticationHelper.default.providersForTeam(team).map(_presenters.presentProviderConfig)
        }
      };
      return;
    }
  }
  const domain = (0, _domains.parseDomain)(ctx.request.hostname);
  if (domain.custom) {
    const team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        domain: ctx.request.hostname
      }
    });
    if (team) {
      ctx.body = {
        data: {
          name: team.name,
          customTheme: team.getPreference(_types.TeamPreference.CustomTheme),
          logo: team.getPreference(_types.TeamPreference.PublicBranding) ? team.avatarUrl : undefined,
          hostname: ctx.request.hostname,
          providers: _AuthenticationHelper.default.providersForTeam(team).map(_presenters.presentProviderConfig)
        }
      };
      return;
    }
  }

  // If subdomain signin page then we return minimal team details to allow
  // for a custom screen showing only relevant signin options for that team.
  else if (_env.default.isCloudHosted && domain.teamSubdomain) {
    const team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        subdomain: domain.teamSubdomain
      }
    });
    if (team) {
      ctx.body = {
        data: {
          name: team.name,
          customTheme: team.getPreference(_types.TeamPreference.CustomTheme),
          logo: team.getPreference(_types.TeamPreference.PublicBranding) ? team.avatarUrl : undefined,
          hostname: ctx.request.hostname,
          providers: _AuthenticationHelper.default.providersForTeam(team).map(_presenters.presentProviderConfig)
        }
      };
      return;
    }
  }

  // Otherwise, we're requesting from the standard root signin page
  ctx.body = {
    data: {
      providers: _AuthenticationHelper.default.providersForTeam().map(_presenters.presentProviderConfig)
    }
  };
});
router.post("auth.info", (0, _authentication.default)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const sessions = (0, _authentication2.getSessionsInCookie)(ctx);
  const signedInTeamIds = Object.keys(sessions);
  const [team, groups, signedInTeams, availableTeams] = await Promise.all([_models.Team.scope("withDomains").findByPk(user.teamId, {
    rejectOnEmpty: true
  }), user.groups(), _models.Team.findAll({
    where: {
      id: signedInTeamIds
    }
  }), user.availableTeams()]);

  // If the user did not _just_ sign in then we need to check if they continue
  // to have access to the workspace they are signed into.
  if (user.lastSignedInAt && user.lastSignedInAt < (0, _dateFns.subHours)(new Date(), 1)) {
    await _ValidateSSOAccessTask.default.schedule({
      userId: user.id
    });
  }
  ctx.body = {
    data: {
      user: (0, _presenters.presentUser)(user, {
        includeDetails: true
      }),
      team: (0, _presenters.presentTeam)(team),
      groups: await Promise.all(groups.map(_presenters.presentGroup)),
      groupUsers: groups.map(group => (0, _presenters.presentGroupUser)(group.groupUsers[0])),
      collaborationToken: user.getCollaborationToken(),
      availableTeams: (0, _uniqBy.default)([...signedInTeams, ...availableTeams], "id").map(availableTeam => (0, _presenters.presentAvailableTeam)(availableTeam, signedInTeamIds.includes(team.id) || availableTeam.id === user.teamId))
    },
    policies: (0, _presenters.presentPolicies)(user, [team, user, ...groups])
  };
});
router.post("auth.delete", (0, _authentication.default)(), (0, _transaction.transaction)(), async ctx => {
  const {
    auth,
    transaction
  } = ctx.state;
  const {
    user
  } = auth;
  await user.rotateJwtSecret({
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "users.signout",
    userId: user.id,
    data: {
      name: user.name
    }
  });
  ctx.cookies.set("accessToken", "", {
    sameSite: "lax",
    expires: (0, _dateFns.subMinutes)(new Date(), 1)
  });
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;