"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dns = _interopRequireDefault(require("dns"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("./../../../../shared/types");
var _domains = require("./../../../../shared/utils/domains");
var _parseDocumentSlug = _interopRequireDefault(require("./../../../../shared/utils/parseDocumentSlug"));
var _parseMentionUrl = _interopRequireDefault(require("./../../../../shared/utils/parseMentionUrl"));
var _urls = require("./../../../../shared/utils/urls");
var _errors = require("./../../../errors");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _unfurl = _interopRequireDefault(require("./../../../presenters/unfurl"));
var _CacheHelper = require("./../../../utils/CacheHelper");
var _PluginManager = require("./../../../utils/PluginManager");
var _RateLimiter = require("./../../../utils/RateLimiter");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const plugins = _PluginManager.PluginManager.getHooks(_PluginManager.Hook.UnfurlProvider);
router.post("urls.unfurl", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneThousandPerHour), (0, _authentication.default)(), (0, _validate.default)(T.UrlsUnfurlSchema), async ctx => {
  const {
    url,
    documentId
  } = ctx.input.body;
  const {
    user: actor
  } = ctx.state.auth;
  const urlObj = new URL(url);

  // Mentions
  if (urlObj.protocol === "mention:") {
    if (!documentId) {
      throw (0, _errors.ValidationError)("Document ID is required to unfurl a mention");
    }
    const {
      modelId,
      mentionType
    } = (0, _parseMentionUrl.default)(url);

    // TODO: Add support for other mention types
    if (mentionType === _types.MentionType.User) {
      const [user, document] = await Promise.all([_models.User.findByPk(modelId), _models.Document.findByPk(documentId, {
        userId: actor.id
      })]);
      if (!user) {
        throw (0, _errors.NotFoundError)("Mentioned user does not exist");
      }
      if (!document) {
        throw (0, _errors.NotFoundError)("Document does not exist");
      }
      (0, _policies.authorize)(actor, "read", user);
      (0, _policies.authorize)(actor, "read", document);
      ctx.body = await (0, _unfurl.default)({
        type: _types.UnfurlResourceType.Mention,
        user,
        document
      }, {
        includeEmail: !!(0, _policies.can)(actor, "readEmail", user)
      });
    }
    return;
  }

  // Internal resources
  if ((0, _urls.isInternalUrl)(url) || (0, _domains.parseDomain)(url).host === actor.team.domain) {
    const previewDocumentId = (0, _parseDocumentSlug.default)(url);
    if (previewDocumentId) {
      const document = previewDocumentId ? await _models.Document.findByPk(previewDocumentId, {
        userId: actor.id
      }) : undefined;
      if (!document) {
        throw (0, _errors.NotFoundError)("Document does not exist");
      }
      (0, _policies.authorize)(actor, "read", document);
      ctx.body = await (0, _unfurl.default)({
        type: _types.UnfurlResourceType.Document,
        document,
        viewer: actor
      });
      return;
    }
    return ctx.response.status = 204;
  }

  // External resources
  const cachedData = await _CacheHelper.CacheHelper.getData(_CacheHelper.CacheHelper.getUnfurlKey(actor.teamId, url));
  if (cachedData) {
    return ctx.body = await (0, _unfurl.default)(cachedData);
  }
  for (const plugin of plugins) {
    const data = await plugin.value.unfurl(url, actor);
    if (data) {
      if ("error" in data) {
        return ctx.response.status = 204;
      } else {
        await _CacheHelper.CacheHelper.setData(_CacheHelper.CacheHelper.getUnfurlKey(actor.teamId, url), data, plugin.value.cacheExpiry);
        return ctx.body = await (0, _unfurl.default)(data);
      }
    }
  }
  return ctx.response.status = 204;
});
router.post("urls.validateCustomDomain", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _authentication.default)(), (0, _validate.default)(T.UrlsCheckCnameSchema), async ctx => {
  const {
    hostname
  } = ctx.input.body;
  const [team, share] = await Promise.all([_models.Team.findOne({
    where: {
      domain: hostname
    }
  }), _models.Share.findOne({
    where: {
      domain: hostname
    }
  })]);
  if (team || share) {
    throw (0, _errors.ValidationError)("Domain is already in use");
  }
  let addresses;
  try {
    addresses = await new Promise((resolve, reject) => {
      _dns.default.resolveCname(hostname, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  } catch (err) {
    if (err.code === "ENOTFOUND") {
      throw (0, _errors.NotFoundError)("No CNAME record found");
    }
    throw (0, _errors.ValidationError)("Invalid domain");
  }
  if (addresses.length === 0) {
    throw (0, _errors.ValidationError)("No CNAME record found");
  }
  const address = addresses[0];
  const likelyValid = address.endsWith((0, _domains.getBaseDomain)());
  if (!likelyValid) {
    throw (0, _errors.ValidationError)("CNAME is not configured correctly");
  }
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;