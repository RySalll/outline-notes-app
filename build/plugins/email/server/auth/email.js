"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("./../../../../shared/types");
var _domains = require("./../../../../shared/utils/domains");
var _InviteAcceptedEmail = _interopRequireDefault(require("./../../../../server/emails/templates/InviteAcceptedEmail"));
var _SigninEmail = _interopRequireDefault(require("./../../../../server/emails/templates/SigninEmail"));
var _WelcomeEmail = _interopRequireDefault(require("./../../../../server/emails/templates/WelcomeEmail"));
var _env = _interopRequireDefault(require("./../../../../server/env"));
var _errors = require("./../../../../server/errors");
var _rateLimiter = require("./../../../../server/middlewares/rateLimiter");
var _validate = _interopRequireDefault(require("./../../../../server/middlewares/validate"));
var _models = require("./../../../../server/models");
var _RateLimiter = require("./../../../../server/utils/RateLimiter");
var _authentication = require("./../../../../server/utils/authentication");
var _jwt = require("./../../../../server/utils/jwt");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("email", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _validate.default)(T.EmailSchema), async ctx => {
  const {
    email,
    client
  } = ctx.input.body;
  const domain = (0, _domains.parseDomain)(ctx.request.hostname);
  let team;
  if (!_env.default.isCloudHosted) {
    team = await _models.Team.scope("withAuthenticationProviders").findOne();
  } else if (domain.custom) {
    team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        domain: domain.host
      }
    });
  } else if (domain.teamSubdomain) {
    team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        subdomain: domain.teamSubdomain
      }
    });
  }
  if (!team?.emailSigninEnabled) {
    throw (0, _errors.AuthorizationError)();
  }
  const user = await _models.User.scope("withAuthentications").findOne({
    where: {
      teamId: team.id,
      email: email.toLowerCase()
    }
  });
  if (!user) {
    ctx.body = {
      success: true
    };
    return;
  }

  // If the user matches an email address associated with an SSO
  // provider then just forward them directly to that sign-in page
  if (user.authentications.length) {
    const authenticationProvider = user.authentications[0].authenticationProvider;
    ctx.body = {
      redirect: `${team.url}/auth/${authenticationProvider?.name}`
    };
    return;
  }

  // send email to users email address with a short-lived token
  await new _SigninEmail.default({
    to: user.email,
    token: user.getEmailSigninToken(),
    teamUrl: team.url,
    client
  }).schedule();
  user.lastSigninEmailSentAt = new Date();
  await user.save();

  // respond with success regardless of whether an email was sent
  ctx.body = {
    success: true
  };
});
router.get("email.callback", (0, _validate.default)(T.EmailCallbackSchema), async ctx => {
  const {
    token,
    client,
    follow
  } = ctx.input.query;

  // The link in the email does not include the follow query param, this
  // is to help prevent anti-virus, and email clients from pre-fetching the link
  // and spending the token before the user clicks on it. Instead we redirect
  // to the same URL with the follow query param added from the client side.
  if (!follow) {
    return ctx.redirectOnClient(ctx.request.href + "&follow=true");
  }
  let user;
  try {
    user = await (0, _jwt.getUserForEmailSigninToken)(token);
  } catch (err) {
    ctx.redirect(`/?notice=expired-token`);
    return;
  }
  if (!user.team.emailSigninEnabled) {
    return ctx.redirect("/?notice=auth-error");
  }
  if (user.isSuspended) {
    return ctx.redirect("/?notice=user-suspended");
  }
  if (user.isInvited) {
    await new _WelcomeEmail.default({
      to: user.email,
      role: user.role,
      teamUrl: user.team.url
    }).schedule();
    const inviter = await user.$get("invitedBy");
    if (inviter?.subscribedToEventType(_types.NotificationEventType.InviteAccepted)) {
      await new _InviteAcceptedEmail.default({
        to: inviter.email,
        inviterId: inviter.id,
        invitedName: user.name,
        teamUrl: user.team.url
      }).schedule();
    }
  }

  // set cookies on response and redirect to team subdomain
  await (0, _authentication.signIn)(ctx, "email", {
    user,
    team: user.team,
    isNewTeam: false,
    isNewUser: false,
    client
  });
});
var _default = exports.default = router;