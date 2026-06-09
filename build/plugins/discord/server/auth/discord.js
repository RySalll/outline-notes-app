"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _classValidator = require("class-validator");
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _passportOauth = require("passport-oauth2");
var _i18n = require("./../../../../shared/i18n");
var _domains = require("./../../../../shared/utils/domains");
var _email = require("./../../../../shared/utils/email");
var _slugify = _interopRequireDefault(require("./../../../../shared/utils/slugify"));
var _accountProvisioner = _interopRequireDefault(require("./../../../../server/commands/accountProvisioner"));
var _errors = require("./../../../../server/errors");
var _passport = _interopRequireDefault(require("./../../../../server/middlewares/passport"));
var _passport2 = require("./../../../../server/utils/passport");
var _plugin = _interopRequireDefault(require("../../plugin.json"));
var _env = _interopRequireDefault(require("../env"));
var _errors2 = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const scope = ["identify", "email"];
if (_env.default.DISCORD_SERVER_ID) {
  scope.push("guilds", "guilds.members.read");
}
if (_env.default.DISCORD_CLIENT_ID && _env.default.DISCORD_CLIENT_SECRET) {
  _koaPassport.default.use(_plugin.default.id, new _passportOauth.Strategy({
    clientID: _env.default.DISCORD_CLIENT_ID,
    clientSecret: _env.default.DISCORD_CLIENT_SECRET,
    passReqToCallback: true,
    scope,
    // @ts-expect-error custom state store
    store: new _passport2.StateStore(),
    state: true,
    callbackURL: `${_env.default.URL}/auth/${_plugin.default.id}.callback`,
    authorizationURL: "https://discord.com/api/oauth2/authorize",
    tokenURL: "https://discord.com/api/oauth2/token",
    pkce: false
  }, async function (ctx, accessToken, refreshToken, params, _profile, done) {
    try {
      const team = await (0, _passport2.getTeamFromContext)(ctx);
      const client = (0, _passport2.getClientFromContext)(ctx);
      /** Fetch the user's profile */
      const profile = await (0, _passport2.request)("GET", "https://discord.com/api/users/@me", accessToken);
      const email = profile.email;
      if (!email) {
        /** We have the email scope, so this should never happen */
        throw (0, _errors.InvalidRequestError)("Discord profile email is missing");
      }
      const {
        domain
      } = (0, _email.parseEmail)(email);
      if (!domain) {
        throw (0, _errors.TeamDomainRequiredError)();
      }

      /** Determine the user's language from the locale */
      const {
        locale
      } = profile;
      const language = locale ? _i18n.languages.find(l => l.startsWith(locale)) : undefined;

      /** Default user and team names metadata */
      let userName = profile.username;
      let teamName = "Wiki";
      let userAvatarUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
      let teamAvatarUrl = undefined;
      let subdomain = (0, _domains.slugifyDomain)(domain);

      /**
       * If a Discord server is configured, we will check if the user is a member of the server
       * Additionally, we can get the user's nickname in the server if it exists
       */
      if (_env.default.DISCORD_SERVER_ID) {
        /** Fetch the guilds a user is in */
        const guilds = await (0, _passport2.request)("GET", "https://discord.com/api/users/@me/guilds", accessToken);

        /** Find the guild that matches the configured server ID */
        const guild = guilds?.find(g => g.id === _env.default.DISCORD_SERVER_ID);

        /** If the user is not in the server, throw an error */
        if (!guild) {
          throw (0, _errors2.DiscordGuildError)();
        }

        /**
         * Get the guild's icon
         * https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
         **/
        if (guild.icon) {
          const isGif = guild.icon.startsWith("a_");
          if (isGif) {
            teamAvatarUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.gif`;
          } else {
            teamAvatarUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
          }
        }
        teamName = guild.name;
        subdomain = (0, _slugify.default)(guild.name);

        /** If the guild name is a URL, use the subdomain instead – we do not allow URLs in names. */
        if ((0, _classValidator.isURL)(teamName, {
          require_host: false,
          require_protocol: false
        })) {
          teamName = subdomain;
        }

        /** Fetch the user's member object in the server for nickname and roles */
        const guildMember = await (0, _passport2.request)("GET", `https://discord.com/api/users/@me/guilds/${_env.default.DISCORD_SERVER_ID}/member`, accessToken);

        /** If the user has a nickname in the server, use that as the name */
        if (guildMember.nick) {
          userName = guildMember.nick;
        }

        /** If the user has a custom avatar in the server, use that as the avatar */
        if (guildMember.avatar) {
          userAvatarUrl = `https://cdn.discordapp.com/guilds/${guild.id}/users/${profile.id}/avatars/${guildMember.avatar}.png`;
        }

        /** If server roles are configured, check if the user has any of the roles */
        if (_env.default.DISCORD_SERVER_ROLES) {
          const {
            roles
          } = guildMember;
          const hasRole = roles?.some(role => _env.default.DISCORD_SERVER_ROLES?.includes(role));

          /** If the user does not have any of the roles, throw an error */
          if (!hasRole) {
            throw (0, _errors2.DiscordGuildRoleError)();
          }
        }
      }

      // if a team can be inferred, we assume the user is only interested in signing into
      // that team in particular; otherwise, we will do a best effort at finding their account
      // or provisioning a new one (within AccountProvisioner)
      const result = await (0, _accountProvisioner.default)({
        ip: ctx.ip,
        team: {
          teamId: team?.id,
          name: teamName,
          domain,
          subdomain,
          avatarUrl: teamAvatarUrl
        },
        user: {
          email,
          name: userName,
          language,
          avatarUrl: userAvatarUrl
        },
        authenticationProvider: {
          name: _plugin.default.id,
          providerId: _env.default.DISCORD_SERVER_ID ?? ""
        },
        authentication: {
          providerId: profile.id,
          accessToken,
          refreshToken,
          expiresIn: params.expires_in,
          scopes: scope
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
  router.get(_plugin.default.id, _koaPassport.default.authenticate(_plugin.default.id, {
    scope,
    prompt: "consent"
  }));
  router.get(`${_plugin.default.id}.callback`, (0, _passport.default)(_plugin.default.id));
}
var _default = exports.default = router;