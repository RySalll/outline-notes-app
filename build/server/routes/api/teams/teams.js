"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("./../../../../shared/types");
var _teamCreator = _interopRequireDefault(require("./../../../commands/teamCreator"));
var _teamDestroyer = _interopRequireDefault(require("./../../../commands/teamDestroyer"));
var _teamUpdater = _interopRequireDefault(require("./../../../commands/teamUpdater"));
var _ConfirmTeamDeleteEmail = _interopRequireDefault(require("./../../../emails/templates/ConfirmTeamDeleteEmail"));
var _env = _interopRequireDefault(require("./../../../env"));
var _errors = require("./../../../errors");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _RateLimiter = require("./../../../utils/RateLimiter");
var _crypto = require("./../../../utils/crypto");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const emailEnabled = !!(_env.default.SMTP_HOST || _env.default.isDevelopment);
const handleTeamUpdate = async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const team = await _models.Team.findByPk(user.teamId, {
    include: [{
      model: _models.TeamDomain,
      separate: true
    }],
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(user, "update", team);
  const updatedTeam = await (0, _teamUpdater.default)({
    params: ctx.input.body,
    user,
    team,
    ip: ctx.request.ip,
    transaction
  });
  ctx.body = {
    data: (0, _presenters.presentTeam)(updatedTeam),
    policies: (0, _presenters.presentPolicies)(user, [updatedTeam])
  };
};
router.post("team.update", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerMinute), (0, _authentication.default)(), (0, _validate.default)(T.TeamsUpdateSchema), (0, _transaction.transaction)(), handleTeamUpdate);
router.post("teams.update", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerMinute), (0, _authentication.default)(), (0, _validate.default)(T.TeamsUpdateSchema), (0, _transaction.transaction)(), handleTeamUpdate);
router.post("teams.requestDelete", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)(), async ctx => {
  if (!emailEnabled) {
    throw (0, _errors.ValidationError)("Email support is not setup for this instance");
  }
  const {
    user
  } = ctx.state.auth;
  const {
    team
  } = user;
  (0, _policies.authorize)(user, "delete", team);
  await new _ConfirmTeamDeleteEmail.default({
    to: user.email,
    deleteConfirmationCode: team.getDeleteConfirmationCode(user)
  }).schedule();
  ctx.body = {
    success: true
  };
});
router.post("teams.delete", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _authentication.default)(), (0, _validate.default)(T.TeamsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    auth,
    transaction
  } = ctx.state;
  const {
    code
  } = ctx.input.body;
  const {
    user
  } = auth;
  const {
    team
  } = user;
  (0, _policies.authorize)(user, "delete", team);
  if (emailEnabled) {
    const deleteConfirmationCode = team.getDeleteConfirmationCode(user);
    if (!(0, _crypto.safeEqual)(code, deleteConfirmationCode)) {
      throw (0, _errors.ValidationError)("The confirmation code was incorrect");
    }
  }
  await (0, _teamDestroyer.default)({
    team,
    user,
    transaction,
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("teams.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)(), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    name
  } = ctx.request.body;
  const existingTeam = await _models.Team.scope("withAuthenticationProviders").findByPk(user.teamId, {
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "createTeam", existingTeam);
  const authenticationProviders = existingTeam.authenticationProviders.map(provider => ({
    name: provider.name,
    providerId: provider.providerId
  }));
  const team = await (0, _teamCreator.default)({
    name,
    subdomain: name,
    authenticationProviders,
    ip: ctx.ip,
    transaction
  });
  const newUser = await _models.User.create({
    teamId: team.id,
    name: user.name,
    email: user.email,
    role: _types.UserRole.Admin
  }, {
    transaction
  });
  await _models.Event.create({
    name: "users.create",
    actorId: user.id,
    userId: newUser.id,
    teamId: newUser.teamId,
    data: {
      name: newUser.name
    },
    ip: ctx.ip
  }, {
    transaction
  });
  ctx.body = {
    success: true,
    data: {
      team: (0, _presenters.presentTeam)(team),
      transferUrl: `${team.url}/auth/redirect?token=${newUser?.getTransferToken()}`
    }
  };
});
var _default = exports.default = router;