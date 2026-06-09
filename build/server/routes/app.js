"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderShare = exports.renderApp = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _util = _interopRequireDefault(require("util"));
var _escape = _interopRequireDefault(require("lodash/escape"));
var _sequelize = require("sequelize");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _types = require("./../../shared/types");
var _date = require("./../../shared/utils/date");
var _documentLoader = _interopRequireDefault(require("./../commands/documentLoader"));
var _env = _interopRequireDefault(require("./../env"));
var _models = require("./../models");
var _env2 = _interopRequireDefault(require("./../presenters/env"));
var _passport = require("./../utils/passport");
var _prefetchTags = _interopRequireDefault(require("./../utils/prefetchTags"));
var _readManifestFile = _interopRequireDefault(require("./../utils/readManifestFile"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const readFile = _util.default.promisify(_fs.default.readFile);
const entry = "app/index.tsx";
const viteHost = _env.default.URL.replace(`:${_env.default.PORT}`, ":3001");
let indexHtmlCache;
const readIndexFile = async () => {
  if (_env.default.isProduction || _env.default.isTest) {
    if (indexHtmlCache) {
      return indexHtmlCache;
    }
  }
  if (_env.default.isTest) {
    return await readFile(_path.default.join(__dirname, "../static/index.html"));
  }
  if (_env.default.isDevelopment) {
    return await readFile(_path.default.join(__dirname, "../../../server/static/index.html"));
  }
  return indexHtmlCache = await readFile(_path.default.join(__dirname, "../../app/index.html"));
};
const renderApp = async function (ctx, next) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const {
    title = _env.default.APP_NAME,
    description = "A modern team knowledge base for your internal documentation, product specs, support answers, meeting notes, onboarding, &amp; more…",
    canonical = "",
    shortcutIcon = `${_env.default.CDN_URL || ""}/images/favicon-32.png`,
    allowIndexing = true
  } = options;
  if (ctx.request.path === "/realtime/") {
    return next();
  }
  if (!_env.default.isCloudHosted) {
    options.analytics?.forEach(integration => {
      if (integration.settings?.instanceUrl) {
        const parsed = new URL(integration.settings?.instanceUrl);
        const csp = ctx.response.get("Content-Security-Policy");
        ctx.set("Content-Security-Policy", csp.replace("script-src", `script-src ${parsed.host}`));
      }
    });
  }
  const {
    shareId
  } = ctx.params;
  const page = await readIndexFile();
  const environment = `
    <script nonce="${ctx.state.cspNonce}">
      window.env = ${JSON.stringify((0, _env2.default)(_env.default, options)).replace(/</g, "\\u003c")};
    </script>
  `;
  const noIndexTag = allowIndexing ? "" : '<meta name="robots" content="noindex, nofollow">';
  const scriptTags = _env.default.isProduction ? `<script type="module" nonce="${ctx.state.cspNonce}" src="${_env.default.CDN_URL || ""}/static/${(0, _readManifestFile.default)()[entry]["file"]}"></script>` : `<script type="module" nonce="${ctx.state.cspNonce}">
        import RefreshRuntime from "${viteHost}/static/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => { }
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
      <script type="module" nonce="${ctx.state.cspNonce}" src="${viteHost}/static/@vite/client"></script>
      <script type="module" nonce="${ctx.state.cspNonce}" src="${viteHost}/static/${entry}"></script>
    `;
  ctx.body = page.toString().replace(/\{env\}/g, environment).replace(/\{lang\}/g, (0, _date.unicodeCLDRtoISO639)(_env.default.DEFAULT_LANGUAGE)).replace(/\{title\}/g, (0, _escape.default)(title)).replace(/\{description\}/g, (0, _escape.default)(description)).replace(/\{noindex\}/g, noIndexTag).replace(/\{manifest-url\}/g, options.isShare ? "" : "/static/manifest.webmanifest").replace(/\{canonical-url\}/g, canonical).replace(/\{shortcut-icon-url\}/g, shortcutIcon).replace(/\{cdn-url\}/g, _env.default.CDN_URL || "").replace(/\{prefetch\}/g, shareId ? "" : _prefetchTags.default).replace(/\{slack-app-id\}/g, _env.default.public.SLACK_APP_ID || "").replace(/\{script-tags\}/g, scriptTags).replace(/\{csp-nonce\}/g, ctx.state.cspNonce);
};
exports.renderApp = renderApp;
const renderShare = async (ctx, next) => {
  const rootShareId = ctx.state?.rootShare?.id;
  const shareId = rootShareId ?? ctx.params.shareId;
  const documentSlug = ctx.params.documentSlug;

  // Find the share record if publicly published so that the document title
  // can be returned in the server-rendered HTML. This allows it to appear in
  // unfurls with more reliability
  let share, document, team;
  let analytics = [];
  try {
    team = await (0, _passport.getTeamFromContext)(ctx);
    const result = await (0, _documentLoader.default)({
      id: documentSlug,
      shareId,
      teamId: team?.id
    });
    share = result.share;
    if ((0, _isUUID.default)(shareId) && share?.urlId) {
      // Redirect temporarily because the url slug
      // can be modified by the user at any time
      ctx.redirect(share.canonicalUrl);
      ctx.status = 307;
      return;
    }
    document = result.document;
    analytics = await _models.Integration.findAll({
      where: {
        teamId: document.teamId,
        type: _types.IntegrationType.Analytics
      }
    });
    if (share && !ctx.userAgent.isBot) {
      await share.update({
        lastAccessedAt: new Date(),
        views: _sequelize.Sequelize.literal("views + 1")
      }, {
        hooks: false
      });
    }
  } catch (err) {
    // If the share or document does not exist, return a 404.
    ctx.status = 404;
  }

  // Allow shares to be embedded in iframes on other websites
  ctx.remove("X-Frame-Options");

  // Inject share information in SSR HTML
  return renderApp(ctx, next, {
    title: document?.title,
    description: document?.getSummary(),
    shortcutIcon: team?.getPreference(_types.TeamPreference.PublicBranding) && team.avatarUrl ? team.avatarUrl : undefined,
    analytics,
    isShare: true,
    rootShareId,
    canonical: share ? `${share.canonicalUrl}${documentSlug && document ? document.url : ""}` : undefined,
    allowIndexing: share?.allowIndexing
  });
};
exports.renderShare = renderShare;