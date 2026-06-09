"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _lodash = require("lodash");
var _isNull = _interopRequireDefault(require("lodash/isNull"));
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _sequelize = require("sequelize");
var _notificationUpdater = _interopRequireDefault(require("./../../../commands/notificationUpdater"));
var _env = _interopRequireDefault(require("./../../../env"));
var _errors = require("./../../../errors");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _NotificationSettingsHelper = _interopRequireDefault(require("./../../../models/helpers/NotificationSettingsHelper"));
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _notification = _interopRequireDefault(require("./../../../presenters/notification"));
var _crypto = require("./../../../utils/crypto");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const handleUnsubscribe = async ctx => {
  const eventType = ctx.input.body.eventType ?? ctx.input.query.eventType;
  const userId = ctx.input.body.userId ?? ctx.input.query.userId;
  const token = ctx.input.body.token ?? ctx.input.query.token;
  const unsubscribeToken = _NotificationSettingsHelper.default.unsubscribeToken(userId, eventType);
  if (unsubscribeToken !== token) {
    ctx.redirect(`${_env.default.URL}?notice=invalid-auth`);
    return;
  }
  const user = await _models.User.scope("withTeam").findByPk(userId, {
    rejectOnEmpty: true
  });
  user.setNotificationEventType(eventType, false);
  await user.save();
  ctx.redirect(`${user.team.url}/settings/notifications?success`);
};
router.get("notifications.unsubscribe", (0, _validate.default)(T.NotificationsUnsubscribeSchema), (0, _transaction.transaction)(), handleUnsubscribe);
router.post("notifications.unsubscribe", (0, _validate.default)(T.NotificationsUnsubscribeSchema), (0, _transaction.transaction)(), handleUnsubscribe);
router.post("notifications.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.NotificationsListSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    eventType,
    archived
  } = ctx.input.body;
  const user = ctx.state.auth.user;
  let where = {
    teamId: user.teamId,
    userId: user.id
  };
  if (eventType) {
    where = {
      ...where,
      event: eventType
    };
  }
  if (!(0, _lodash.isNil)(archived)) {
    where = {
      ...where,
      archivedAt: archived ? {
        [_sequelize.Op.ne]: null
      } : {
        [_sequelize.Op.eq]: null
      }
    };
  }
  const [notifications, total, unseen] = await Promise.all([_models.Notification.findAll({
    where,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Notification.count({
    where
  }), _models.Notification.count({
    where: {
      ...where,
      viewedAt: {
        [_sequelize.Op.is]: null
      }
    }
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: {
      notifications: await Promise.all(notifications.map(notification => (0, _notification.default)(ctx, notification))),
      unseen
    }
  };
});
router.get("notifications.pixel", (0, _validate.default)(T.NotificationsPixelSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    token
  } = ctx.input.query;
  const notification = await _models.Notification.unscoped().findByPk(id);
  if (!notification || !(0, _crypto.safeEqual)(token, notification.pixelToken)) {
    throw (0, _errors.AuthenticationError)();
  }
  if (!notification.viewedAt) {
    await (0, _notificationUpdater.default)(ctx, {
      notification,
      viewedAt: new Date()
    });
  }
  ctx.response.set("Content-Type", "image/gif");
  ctx.body = pixel;
});
router.post("notifications.update", (0, _authentication.default)(), (0, _validate.default)(T.NotificationsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    viewedAt,
    archivedAt
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const notification = await _models.Notification.findByPk(id);
  (0, _policies.authorize)(user, "update", notification);
  await (0, _notificationUpdater.default)(ctx, {
    notification,
    viewedAt,
    archivedAt
  });
  ctx.body = {
    data: await (0, _notification.default)(ctx, notification),
    policies: (0, _presenters.presentPolicies)(user, [notification])
  };
});
router.post("notifications.update_all", (0, _authentication.default)(), (0, _validate.default)(T.NotificationsUpdateAllSchema), async ctx => {
  const {
    viewedAt,
    archivedAt
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const values = {};
  let where = {
    teamId: user.teamId,
    userId: user.id
  };
  if (!(0, _isUndefined.default)(viewedAt)) {
    values.viewedAt = viewedAt;
    where = {
      ...where,
      viewedAt: !(0, _isNull.default)(viewedAt) ? {
        [_sequelize.Op.is]: null
      } : {
        [_sequelize.Op.ne]: null
      }
    };
  }
  if (!(0, _isUndefined.default)(archivedAt)) {
    values.archivedAt = archivedAt;
    where = {
      ...where,
      archivedAt: !(0, _isNull.default)(archivedAt) ? {
        [_sequelize.Op.is]: null
      } : {
        [_sequelize.Op.ne]: null
      }
    };
  }
  const [total] = await _models.Notification.update(values, {
    where
  });
  ctx.body = {
    success: true,
    data: {
      total
    }
  };
});
var _default = exports.default = router;