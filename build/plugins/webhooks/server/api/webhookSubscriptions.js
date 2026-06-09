"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compact = _interopRequireDefault(require("lodash/compact"));
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _types = require("./../../../../shared/types");
var _authentication = _interopRequireDefault(require("./../../../../server/middlewares/authentication"));
var _transaction = require("./../../../../server/middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../../server/middlewares/validate"));
var _models = require("./../../../../server/models");
var _policies = require("./../../../../server/policies");
var _pagination = _interopRequireDefault(require("./../../../../server/routes/api/middlewares/pagination"));
var _webhookSubscription = _interopRequireDefault(require("../presenters/webhookSubscription"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("webhookSubscriptions.list", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _pagination.default)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "listWebhookSubscription", user.team);
  const webhooks = await _models.WebhookSubscription.findAll({
    where: {
      teamId: user.teamId
    },
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: webhooks.map(_webhookSubscription.default)
  };
});
router.post("webhookSubscriptions.create", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.WebhookSubscriptionsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    url,
    secret,
    events
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createWebhookSubscription", user.team);
  const webhookSubscription = await _models.WebhookSubscription.createWithCtx(ctx, {
    name,
    url,
    events: (0, _compact.default)(events),
    enabled: true,
    secret: (0, _isEmpty.default)(secret) ? undefined : secret,
    createdById: user.id,
    teamId: user.teamId
  });
  ctx.body = {
    data: (0, _webhookSubscription.default)(webhookSubscription)
  };
});
router.post("webhookSubscriptions.delete", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.WebhookSubscriptionsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const webhookSubscription = await _models.WebhookSubscription.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(user, "delete", webhookSubscription);
  await webhookSubscription.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("webhookSubscriptions.update", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.WebhookSubscriptionsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    name,
    url,
    secret,
    events
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const webhookSubscription = await _models.WebhookSubscription.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(user, "update", webhookSubscription);
  await webhookSubscription.updateWithCtx(ctx, {
    name,
    url,
    events: (0, _compact.default)(events),
    enabled: true,
    secret: (0, _isEmpty.default)(secret) ? undefined : secret
  });
  ctx.body = {
    data: (0, _webhookSubscription.default)(webhookSubscription)
  };
});
var _default = exports.default = router;