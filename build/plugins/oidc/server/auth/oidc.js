"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _get = _interopRequireDefault(require("lodash/get"));
var _passportOauth = require("passport-oauth2");
var _domains = require("./../../../../shared/utils/domains");
var _email = require("./../../../../shared/utils/email");
var _accountProvisioner = _interopRequireDefault(require("./../../../../server/commands/accountProvisioner"));
var _errors = require("./../../../../server/errors");
var _passport = _interopRequireDefault(require("./../../../../server/middlewares/passport"));
var _models = require("./../../../../server/models");
var _passport2 = require("./../../../../server/utils/passport");
var _plugin = _interopRequireDefault(require("../../plugin.json"));
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const scopes = _env.default.OIDC_SCOPES.split(" ");
const authorizationParams = _passportOauth.Strategy.prototype.authorizationParams;
_passportOauth.Strategy.prototype.authorizationParams = function (options) {
  return {
    ...(options.originalQuery || {}),
    ...(authorizationParams.bind(this)(options) || {})
  };
};
const authenticate = _passportOauth.Strategy.prototype.authenticate;
_passportOauth.Strategy.prototype.authenticate = function (req, options) {
  options.originalQuery = req.query;
  authenticate.bind(this)(req, options);
};
if (_env.default.OIDC_CLIENT_ID && _env.default.OIDC_CLIENT_SECRET && _env.default.OIDC_AUTH_URI && _env.default.OIDC_TOKEN_URI && _env.default.OIDC_USERINFO_URI) {
  _koaPassport.default.use(_plugin.default.id, new _passportOauth.Strategy({
    authorizationURL: _env.default.OIDC_AUTH_URI,
    tokenURL: _env.default.OIDC_TOKEN_URI,
    clientID: _env.default.OIDC_CLIENT_ID,
    clientSecret: _env.default.OIDC_CLIENT_SECRET,
    callbackURL: `${_env.default.URL}/auth/${_plugin.default.id}.callback`,
    passReqToCallback: true,
    scope: _env.default.OIDC_SCOPES,
    // @ts-expect-error custom state store
    store: new _passport2.StateStore(),
    state: true,
    pkce: false
  },
  // OpenID Connect standard profile claims can be found in the official
  // specification.
  // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
  // Non-standard claims may be configured by individual identity providers.
  // Any claim supplied in response to the userinfo request will be
  // available on the `profile` parameter
  async function (ctx, accessToken, refreshToken, params, _profile, done) {
    try {
      // Some providers require a POST request to the userinfo endpoint, add them as exceptions here.
      const usePostMethod = ["https://api.dropboxapi.com/2/openid/userinfo"];
      const profile = await (0, _passport2.request)(usePostMethod.includes(_env.default.OIDC_USERINFO_URI) ? "POST" : "GET", _env.default.OIDC_USERINFO_URI, accessToken);
      if (!profile.email) {
        throw (0, _errors.AuthenticationError)(`An email field was not returned in the profile parameter, but is required.`);
      }
      const team = await (0, _passport2.getTeamFromContext)(ctx);
      const client = (0, _passport2.getClientFromContext)(ctx);
      const {
        domain
      } = (0, _email.parseEmail)(profile.email);

      // Only a single OIDC provider is supported – find the existing, if any.
      const authenticationProvider = team ? (await _models.AuthenticationProvider.findOne({
        where: {
          name: "oidc",
          teamId: team.id,
          providerId: domain
        }
      })) ?? (await _models.AuthenticationProvider.findOne({
        where: {
          name: "oidc",
          teamId: team.id
        }
      })) : undefined;

      // Derive a providerId from the OIDC location if there is no existing provider.
      const oidcURL = new URL(_env.default.OIDC_AUTH_URI);
      const providerId = authenticationProvider?.providerId ?? oidcURL.hostname;
      if (!domain) {
        throw (0, _errors.OIDCMalformedUserInfoError)();
      }

      // remove the TLD and form a subdomain from the remaining
      const subdomain = (0, _domains.slugifyDomain)(domain);

      // Claim name can be overriden using an env variable.
      // Default is 'preferred_username' as per OIDC spec.
      const username = (0, _get.default)(profile, _env.default.OIDC_USERNAME_CLAIM);
      const name = profile.name || username || profile.username;
      const profileId = profile.sub ? profile.sub : profile.id;
      if (!name) {
        throw (0, _errors.AuthenticationError)(`Neither a name or username was returned in the profile parameter, but at least one is required.`);
      }
      const result = await (0, _accountProvisioner.default)({
        ip: ctx.ip,
        team: {
          teamId: team?.id,
          name: _env.default.APP_NAME,
          domain,
          subdomain
        },
        user: {
          name,
          email: profile.email,
          avatarUrl: profile.picture
        },
        authenticationProvider: {
          name: _plugin.default.id,
          providerId
        },
        authentication: {
          providerId: profileId,
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
  }));
  router.get(_plugin.default.id, _koaPassport.default.authenticate(_plugin.default.id));
  router.get(`${_plugin.default.id}.callback`, (0, _passport.default)(_plugin.default.id));
  router.post(`${_plugin.default.id}.callback`, (0, _passport.default)(_plugin.default.id));
}
var _default = exports.default = router;