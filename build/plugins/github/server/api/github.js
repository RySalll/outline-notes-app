"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _find = _interopRequireDefault(require("lodash/find"));
var _types = require("./../../../../shared/types");
var _domains = require("./../../../../shared/utils/domains");
var _Logger = _interopRequireDefault(require("./../../../../server/logging/Logger"));
var _authentication = _interopRequireDefault(require("./../../../../server/middlewares/authentication"));
var _transaction = require("./../../../../server/middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../../server/middlewares/validate"));
var _models = require("./../../../../server/models");
var _GitHubUtils = require("../../shared/GitHubUtils");
var _github = require("../github");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.get("github.callback", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.GitHubCallbackSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    code,
    state: teamId,
    error,
    installation_id: installationId,
    setup_action: setupAction
  } = ctx.input.query;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  if (error) {
    ctx.redirect(_GitHubUtils.GitHubUtils.errorUrl(error));
    return;
  }
  if (setupAction === T.SetupAction.request) {
    ctx.redirect(_GitHubUtils.GitHubUtils.installRequestUrl());
    return;
  }

  // this code block accounts for the root domain being unable to
  // access authentication for subdomains. We must forward to the appropriate
  // subdomain to complete the oauth flow
  if (!user) {
    if (teamId) {
      try {
        const team = await _models.Team.findByPk(teamId, {
          rejectOnEmpty: true,
          transaction
        });
        return (0, _domains.parseDomain)(ctx.host).teamSubdomain === team.subdomain ? ctx.redirect("/") : ctx.redirectOnClient(_GitHubUtils.GitHubUtils.callbackUrl({
          baseUrl: team.url,
          params: ctx.request.querystring
        }));
      } catch (err) {
        _Logger.default.error(`Error fetching team for teamId: ${teamId}!`, err);
        return ctx.redirect(_GitHubUtils.GitHubUtils.errorUrl("unauthenticated"));
      }
    } else {
      return ctx.redirect(_GitHubUtils.GitHubUtils.errorUrl("unauthenticated"));
    }
  }
  const client = await _github.GitHub.authenticateAsUser(code, teamId);
  const installationsByUser = await client.requestAppInstallations();
  const installation = (0, _find.default)(installationsByUser, i => i.id === installationId);
  if (!installation) {
    return ctx.redirect(_GitHubUtils.GitHubUtils.errorUrl("unauthenticated"));
  }
  const authentication = await _models.IntegrationAuthentication.create({
    service: _types.IntegrationService.GitHub,
    userId: user.id,
    teamId: user.teamId
  }, {
    transaction
  });
  await _models.Integration.create({
    service: _types.IntegrationService.GitHub,
    type: _types.IntegrationType.Embed,
    userId: user.id,
    teamId: user.teamId,
    authenticationId: authentication.id,
    settings: {
      github: {
        installation: {
          id: installationId,
          account: {
            id: installation.account?.id,
            name:
            // @ts-expect-error Property 'login' does not exist on type
            installation.account?.login,
            avatarUrl: installation.account?.avatar_url
          }
        }
      }
    }
  }, {
    transaction
  });
  ctx.redirect(_GitHubUtils.GitHubUtils.url);
});
var _default = exports.default = router;