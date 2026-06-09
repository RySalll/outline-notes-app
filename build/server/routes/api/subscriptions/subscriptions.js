"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _types = require("./../../../../shared/types");
var _subscriptionCreator = _interopRequireDefault(require("./../../../commands/subscriptionCreator"));
var _context = require("./../../../context");
var _env = _interopRequireDefault(require("./../../../env"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _SubscriptionHelper = _interopRequireDefault(require("./../../../models/helpers/SubscriptionHelper"));
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _RateLimiter = require("./../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("subscriptions.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.SubscriptionsListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    documentId,
    event
  } = ctx.input.body;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", document);
  const subscriptions = await _models.Subscription.findAll({
    where: {
      documentId: document.id,
      userId: user.id,
      event
    },
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: subscriptions.map(_presenters.presentSubscription)
  };
});
router.post("subscriptions.info", (0, _authentication.default)(), (0, _validate.default)(T.SubscriptionsInfoSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    documentId,
    event
  } = ctx.input.body;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", document);

  // There can be only one subscription with these props.
  const subscription = await _models.Subscription.findOne({
    where: {
      userId: user.id,
      documentId: document.id,
      event
    },
    rejectOnEmpty: true
  });
  ctx.body = {
    data: (0, _presenters.presentSubscription)(subscription)
  };
});
router.post("subscriptions.create", (0, _authentication.default)(), (0, _validate.default)(T.SubscriptionsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    documentId,
    event
  } = ctx.input.body;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "subscribe", document);
  const subscription = await (0, _subscriptionCreator.default)({
    ctx,
    documentId: document.id,
    event
  });
  ctx.body = {
    data: (0, _presenters.presentSubscription)(subscription)
  };
});
router.get("subscriptions.delete", (0, _validate.default)(T.SubscriptionsDeleteTokenSchema), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerMinute), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    userId,
    documentId,
    token
  } = ctx.input.query;
  const unsubscribeToken = _SubscriptionHelper.default.unsubscribeToken(userId, documentId);
  if (unsubscribeToken !== token) {
    ctx.redirect(`${_env.default.URL}?notice=invalid-auth`);
    return;
  }
  const [subscription, user] = await Promise.all([_models.Subscription.findOne({
    where: {
      userId,
      documentId
    },
    lock: _sequelize.Transaction.LOCK.UPDATE,
    rejectOnEmpty: true,
    transaction
  }), _models.User.scope("withTeam").findByPk(userId, {
    rejectOnEmpty: true,
    transaction
  })]);
  (0, _policies.authorize)(user, "delete", subscription);
  await subscription.destroyWithCtx((0, _context.createContext)({
    user,
    ip: ctx.request.ip,
    transaction
  }));
  ctx.redirect(`${user.team.url}/home?notice=${_types.QueryNotices.UnsubscribeDocument}`);
});
router.post("subscriptions.delete", (0, _authentication.default)(), (0, _validate.default)(T.SubscriptionsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    id
  } = ctx.input.body;
  const subscription = await _models.Subscription.findByPk(id, {
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "delete", subscription);
  await subscription.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;