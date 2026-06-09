"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _types = require("./../../../../shared/types");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _Integration = _interopRequireDefault(require("./../../../models/Integration"));
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("integrations.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.IntegrationsListSchema), async ctx => {
  const {
    direction,
    service,
    type,
    sort
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  let where = {
    teamId: user.teamId
  };
  if (type) {
    where = {
      ...where,
      type
    };
  }
  if (service) {
    where = {
      ...where,
      service
    };
  }

  // Linked account is special as these are user-specific, other integrations are workspace-wide.
  where = {
    ...where,
    [_sequelize.Op.or]: [{
      userId: user.id,
      type: _types.IntegrationType.LinkedAccount
    }, {
      type: {
        [_sequelize.Op.not]: _types.IntegrationType.LinkedAccount
      }
    }]
  };
  const [integrations, total] = await Promise.all([await _Integration.default.findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _Integration.default.count({
    where
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: integrations.map(_presenters.presentIntegration),
    policies: (0, _presenters.presentPolicies)(user, integrations)
  };
});
router.post("integrations.create", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.IntegrationsCreateSchema), async ctx => {
  const {
    type,
    service,
    settings
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createIntegration", user.team);
  const integration = await _Integration.default.create({
    userId: user.id,
    teamId: user.teamId,
    service,
    settings,
    type
  });
  ctx.body = {
    data: (0, _presenters.presentIntegration)(integration),
    policies: (0, _presenters.presentPolicies)(user, [integration])
  };
});
router.post("integrations.info", (0, _authentication.default)(), (0, _validate.default)(T.IntegrationsInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const integration = await _Integration.default.findByPk(id, {
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", integration);
  ctx.body = {
    data: (0, _presenters.presentIntegration)(integration),
    policies: (0, _presenters.presentPolicies)(user, [integration])
  };
});
router.post("integrations.update", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.IntegrationsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    events,
    settings
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const integration = await _Integration.default.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "update", integration);
  if (integration.type === _types.IntegrationType.Post) {
    integration.events = events.filter(event => ["documents.update", "documents.publish"].includes(event));
  }
  integration.settings = settings;
  await integration.save({
    transaction
  });
  ctx.body = {
    data: (0, _presenters.presentIntegration)(integration),
    policies: (0, _presenters.presentPolicies)(user, [integration])
  };
});
router.post("integrations.delete", (0, _authentication.default)(), (0, _validate.default)(T.IntegrationsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const integration = await _Integration.default.findByPk(id, {
    rejectOnEmpty: true,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", integration);
  await integration.destroy({
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "integrations.delete",
    modelId: integration.id
  });
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;