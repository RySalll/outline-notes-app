"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("./../../../../shared/types");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _types2 = require("./../../../types");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("apiKeys.create", (0, _authentication.default)({
  role: _types.UserRole.Member,
  type: _types2.AuthenticationType.APP
}), (0, _validate.default)(T.APIKeysCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    scope,
    expiresAt
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createApiKey", user.team);
  const apiKey = await _models.ApiKey.createWithCtx(ctx, {
    name,
    userId: user.id,
    expiresAt,
    scope: scope?.map(s => s.startsWith("/api/") ? s : `/api/${s}`)
  });
  ctx.body = {
    data: (0, _presenters.presentApiKey)(apiKey)
  };
});
router.post("apiKeys.list", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _pagination.default)(), (0, _validate.default)(T.APIKeysListSchema), async ctx => {
  const {
    userId
  } = ctx.input.body;
  const {
    pagination
  } = ctx.state;
  const actor = ctx.state.auth.user;
  let where = {
    teamId: actor.teamId
  };
  if ((0, _policies.cannot)(actor, "listApiKeys", actor.team)) {
    where = {
      ...where,
      id: actor.id
    };
  }
  if (userId) {
    const user = await _models.User.findByPk(userId);
    (0, _policies.authorize)(actor, "listApiKeys", user);
    where = {
      ...where,
      id: userId
    };
  }
  const apiKeys = await _models.ApiKey.findAll({
    include: [{
      model: _models.User,
      required: true,
      where
    }],
    order: [["createdAt", "DESC"]],
    offset: pagination.offset,
    limit: pagination.limit
  });
  ctx.body = {
    pagination,
    data: apiKeys.map(_presenters.presentApiKey)
  };
});
router.post("apiKeys.delete", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _validate.default)(T.APIKeysDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const key = await _models.ApiKey.findByPk(id, {
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(user, "delete", key);
  await key.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;