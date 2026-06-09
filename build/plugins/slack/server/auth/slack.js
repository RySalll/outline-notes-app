"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _passportSlackOauth = require("passport-slack-oauth2");
var _types = require("./../../../../shared/types");
var _domains = require("./../../../../shared/utils/domains");
var _accountProvisioner = _interopRequireDefault(require("./../../../../server/commands/accountProvisioner"));
var _errors = require("./../../../../server/errors");
var _authentication = _interopRequireDefault(require("./../../../../server/middlewares/authentication"));
var _passport = _interopRequireDefault(require("./../../../../server/middlewares/passport"));
var _validate = _interopRequireDefault(require("./../../../../server/middlewares/validate"));
var _models = require("./../../../../server/models");
var _policies = require("./../../../../server/policies");
var _database = require("./../../../../server/storage/database");
var _passport2 = require("./../../../../server/utils/passport");
var _env = _interopRequireDefault(require("../env"));
var Slack = _interopRequireWildcard(require("../slack"));
var T = _interopRequireWildcard(require("./schema"));
var _SlackUtils = require("./../../shared/SlackUtils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const providerName = "slack";
const scopes = ["identity.email", "identity.basic", "identity.avatar", "identity.team"];
if (_env.default.SLACK_CLIENT_ID && _env.default.SLACK_CLIENT_SECRET) {
  const strategy = new _passportSlackOauth.Strategy({
    clientID: _env.default.SLACK_CLIENT_ID,
    clientSecret: _env.default.SLACK_CLIENT_SECRET,
    callbackURL: _SlackUtils.SlackUtils.callbackUrl(),
    passReqToCallback: true,
    // @ts-expect-error StateStore
    store: new _passport2.StateStore(),
    scope: scopes
  }, async function (ctx, accessToken, refreshToken, params, profile, done) {
    try {
      const team = await (0, _passport2.getTeamFromContext)(ctx);
      const client = (0, _passport2.getClientFromContext)(ctx);
      const result = await (0, _accountProvisioner.default)({
        ip: ctx.ip,
        team: {
          teamId: team?.id,
          name: profile.team.name,
          subdomain: profile.team.domain,
          avatarUrl: profile.team.image_230
        },
        user: {
          name: profile.user.name,
          email: profile.user.email,
          avatarUrl: profile.user.image_192
        },
        authenticationProvider: {
          name: providerName,
          providerId: profile.team.id
        },
        authentication: {
          providerId: profile.user.id,
          accessToken,
          refreshToken,
          expiresIn: params.expires_in,
          scopes
        }
      });
      return done(null, result.user, {
        ...result,
        client
      });
    } catch (err) {
      return done(err, null);
    }
  });
  // For some reason the author made the strategy name capatilised, I don't know
  // why but we need everything lowercase so we just monkey-patch it here.
  strategy.name = providerName;
  _koaPassport.default.use(strategy);
  router.get("slack", _koaPassport.default.authenticate(providerName));
  router.get("slack.callback", (0, _passport.default)(providerName));
  router.get("slack.post", (0, _authentication.default)({
    optional: true
  }), (0, _validate.default)(T.SlackPostSchema), async ctx => {
    const {
      code,
      error,
      state
    } = ctx.input.query;
    const {
      user
    } = ctx.state.auth;
    if (error) {
      ctx.redirect(_SlackUtils.SlackUtils.errorUrl(error));
      return;
    }
    let parsedState;
    try {
      parsedState = _SlackUtils.SlackUtils.parseState(state);
    } catch (err) {
      throw (0, _errors.ValidationError)("Invalid state");
    }
    const {
      teamId,
      collectionId,
      type
    } = parsedState;

    // This code block accounts for the root domain being unable to access authentication for
    // subdomains. We must forward to the appropriate subdomain to complete the OAuth flow.
    if (!user) {
      if (teamId) {
        try {
          const team = await _models.Team.findByPk(teamId, {
            rejectOnEmpty: true
          });
          return (0, _domains.parseDomain)(ctx.host).teamSubdomain === team.subdomain ? ctx.redirect("/") : ctx.redirectOnClient(_SlackUtils.SlackUtils.connectUrl({
            baseUrl: team.url,
            params: ctx.request.querystring
          }));
        } catch (err) {
          return ctx.redirect(_SlackUtils.SlackUtils.errorUrl("unauthenticated"));
        }
      } else {
        return ctx.redirect(_SlackUtils.SlackUtils.errorUrl("unauthenticated"));
      }
    }
    switch (type) {
      case _types.IntegrationType.Post:
        {
          const collection = await _models.Collection.scope({
            method: ["withMembership", user.id]
          }).findByPk(collectionId);
          (0, _policies.authorize)(user, "read", collection);
          (0, _policies.authorize)(user, "update", user.team);

          // validation middleware ensures that code is non-null at this point
          const data = await Slack.oauthAccess(code, _SlackUtils.SlackUtils.connectUrl());
          await _database.sequelize.transaction(async transaction => {
            const authentication = await _models.IntegrationAuthentication.create({
              service: _types.IntegrationService.Slack,
              userId: user.id,
              teamId: user.teamId,
              token: data.access_token,
              scopes: data.scope.split(",")
            }, {
              transaction
            });
            await _models.Integration.create({
              service: _types.IntegrationService.Slack,
              type: _types.IntegrationType.Post,
              userId: user.id,
              teamId: user.teamId,
              authenticationId: authentication.id,
              collectionId,
              events: ["documents.update", "documents.publish"],
              settings: {
                url: data.incoming_webhook.url,
                channel: data.incoming_webhook.channel,
                channelId: data.incoming_webhook.channel_id
              }
            }, {
              transaction
            });
          });
          break;
        }
      case _types.IntegrationType.Command:
        {
          (0, _policies.authorize)(user, "update", user.team);

          // validation middleware ensures that code is non-null at this point
          const data = await Slack.oauthAccess(code, _SlackUtils.SlackUtils.connectUrl());
          await _database.sequelize.transaction(async transaction => {
            const authentication = await _models.IntegrationAuthentication.create({
              service: _types.IntegrationService.Slack,
              userId: user.id,
              teamId: user.teamId,
              token: data.access_token,
              scopes: data.scope.split(",")
            }, {
              transaction
            });
            await _models.Integration.create({
              service: _types.IntegrationService.Slack,
              type: _types.IntegrationType.Command,
              userId: user.id,
              teamId: user.teamId,
              authenticationId: authentication.id,
              settings: {
                serviceTeamId: data.team_id
              }
            }, {
              transaction
            });
          });
          break;
        }
      case _types.IntegrationType.LinkedAccount:
        {
          // validation middleware ensures that code is non-null at this point
          const data = await Slack.oauthAccess(code, _SlackUtils.SlackUtils.connectUrl());
          await _models.Integration.create({
            service: _types.IntegrationService.Slack,
            type: _types.IntegrationType.LinkedAccount,
            userId: user.id,
            teamId: user.teamId,
            settings: {
              slack: {
                serviceUserId: data.user_id,
                serviceTeamId: data.team_id
              }
            }
          });
          break;
        }
      default:
        throw (0, _errors.ValidationError)("Invalid integration type");
    }
    ctx.redirect(_SlackUtils.SlackUtils.url);
  });
}
var _default = exports.default = router;