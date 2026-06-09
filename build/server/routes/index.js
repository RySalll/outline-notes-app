"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _path = _interopRequireDefault(require("path"));
var _dateFns = require("date-fns");
var _koa = _interopRequireDefault(require("koa"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _koaSend = _interopRequireDefault(require("koa-send"));
var _koaUseragent = _interopRequireDefault(require("koa-useragent"));
var _i18n = require("./../../shared/i18n");
var _types = require("./../../shared/types");
var _time = require("./../../shared/utils/time");
var _env = _interopRequireDefault(require("./../env"));
var _errors = require("./../errors");
var _shareDomains = _interopRequireDefault(require("./../middlewares/shareDomains"));
var _models = require("./../models");
var _opensearch = require("./../utils/opensearch");
var _passport = require("./../utils/passport");
var _robots = require("./../utils/robots");
var _apexRedirect = _interopRequireDefault(require("../middlewares/apexRedirect"));
var _app = require("./app");
var _embeds = require("./embeds");
var _errors2 = _interopRequireDefault(require("./errors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const koa = new _koa.default();
const router = new _koaRouter.default();
koa.use(_koaUseragent.default);

// serve public assets
router.use(["/images/*", "/email/*", "/fonts/*"], async (ctx, next) => {
  let done;
  if (ctx.method === "HEAD" || ctx.method === "GET") {
    try {
      done = await (0, _koaSend.default)(ctx, ctx.path, {
        root: _path.default.resolve(__dirname, "../../../public"),
        // 7 day expiry, these assets are mostly static but do not contain a hash
        maxAge: _time.Day.ms * 7,
        setHeaders: res => {
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      });
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
    }
  }
  if (!done) {
    await next();
  }
});
router.use(["/share/:shareId", "/share/:shareId/doc/:documentSlug", "/share/:shareId/*"], ctx => {
  ctx.redirect(ctx.path.replace(/^\/share/, "/s"));
  ctx.status = 301;
});
if (_env.default.isProduction) {
  router.get("/static/*", async ctx => {
    try {
      const pathname = ctx.path.substring(8);
      if (!pathname) {
        throw (0, _errors.NotFoundError)();
      }
      await (0, _koaSend.default)(ctx, pathname, {
        root: _path.default.join(__dirname, "../../app/"),
        // Hashed static assets get 1 year expiry plus immutable flag
        maxAge: _time.Day.ms * 365,
        immutable: true,
        setHeaders: res => {
          res.setHeader("Service-Worker-Allowed", "/");
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      });
    } catch (err) {
      if (err.status === 404) {
        // Serve a bad request instead of not found if the file doesn't exist
        // This prevents CDN's from caching the response, allowing them to continue
        // serving old file versions
        ctx.status = 400;
        return;
      }
      throw err;
    }
  });
}
router.get("/locales/:lng.json", async ctx => {
  const {
    lng
  } = ctx.params;
  if (!_i18n.languages.includes(lng)) {
    ctx.status = 404;
    return;
  }
  await (0, _koaSend.default)(ctx, _path.default.join(lng, "translation.json"), {
    setHeaders: (res, _, stats) => {
      res.setHeader("Last-Modified", (0, _dateFns.formatRFC7231)(stats.mtime));
      res.setHeader("Cache-Control", `public, max-age=${7 * _time.Day.seconds}`);
      res.setHeader("ETag", _crypto.default.createHash("md5").update(stats.mtime.toISOString()).digest("hex"));
    },
    root: _path.default.join(__dirname, "../../shared/i18n/locales")
  });
});
router.get("/robots.txt", ctx => {
  ctx.body = (0, _robots.robotsResponse)();
});
router.get("/opensearch.xml", ctx => {
  ctx.type = "text/xml";
  ctx.response.set("Cache-Control", `public, max-age=${7 * _time.Day.seconds}`);
  ctx.body = (0, _opensearch.opensearchResponse)(ctx.request.URL.origin);
});
router.get("/s/:shareId", (0, _shareDomains.default)(), _app.renderShare);
router.get("/s/:shareId/doc/:documentSlug", (0, _shareDomains.default)(), _app.renderShare);
router.get("/s/:shareId/*", (0, _shareDomains.default)(), _app.renderShare);
router.get("/embeds/gitlab", _embeds.renderEmbed);
router.get("/embeds/github", _embeds.renderEmbed);
router.get("/embeds/dropbox", _embeds.renderEmbed);
router.get("/embeds/pinterest", _embeds.renderEmbed);

// catch all for application
router.get("*", (0, _shareDomains.default)(), async (ctx, next) => {
  if (ctx.state?.rootShare) {
    return (0, _app.renderShare)(ctx, next);
  }
  const team = await (0, _passport.getTeamFromContext)(ctx);

  // Redirect all requests to custom domain if one is set
  if (team?.domain && team.domain !== ctx.hostname) {
    ctx.redirect(ctx.href.replace(ctx.hostname, team.domain));
    return;
  }
  const analytics = team ? await _models.Integration.findAll({
    where: {
      teamId: team.id,
      type: _types.IntegrationType.Analytics
    }
  }) : [];
  return (0, _app.renderApp)(ctx, next, {
    analytics,
    shortcutIcon: team?.getPreference(_types.TeamPreference.PublicBranding) && team.avatarUrl ? team.avatarUrl : undefined
  });
});

// In order to report all possible performance metrics to Sentry this header
// must be provided when serving the application, see:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin
const timingOrigins = [_env.default.URL];
if (_env.default.SENTRY_DSN) {
  timingOrigins.push("https://sentry.io");
}
koa.use(async (ctx, next) => {
  ctx.set("Timing-Allow-Origin", timingOrigins.join(", "));
  await next();
});
koa.use((0, _apexRedirect.default)());
if (_env.default.ENVIRONMENT === "test") {
  koa.use(_errors2.default.routes());
}
koa.use(router.routes());
var _default = exports.default = koa;