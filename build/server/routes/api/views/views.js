"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _errors = require("./../../../errors");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _RateLimiter = require("./../../../utils/RateLimiter");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("views.list", (0, _authentication.default)(), (0, _validate.default)(T.ViewsListSchema), async ctx => {
  const {
    documentId,
    includeSuspended
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "listViews", document);
  if (!document.insightsEnabled) {
    throw (0, _errors.ValidationError)("Insights are not enabled for this document");
  }
  const views = await _models.View.findByDocument(documentId, {
    includeSuspended
  });
  ctx.body = {
    data: views.map(_presenters.presentView)
  };
});
router.post("views.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneThousandPerHour), (0, _authentication.default)(), (0, _validate.default)(T.ViewsCreateSchema), async ctx => {
  const {
    documentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", document);
  const view = await _models.View.incrementOrCreate({
    documentId,
    userId: user.id
  });
  await _models.Event.createFromContext(ctx, {
    name: "views.create",
    documentId: document.id,
    collectionId: document.collectionId,
    modelId: view.id,
    data: {
      title: document.title
    }
  });
  view.user = user;
  ctx.body = {
    data: (0, _presenters.presentView)(view)
  };
});
var _default = exports.default = router;