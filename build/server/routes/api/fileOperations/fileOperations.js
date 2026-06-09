"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("./../../../../shared/types");
var _errors = require("./../../../errors");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _files = _interopRequireDefault(require("./../../../storage/files"));
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("fileOperations.info", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.FileOperationsInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const fileOperation = await _models.FileOperation.findByPk(id, {
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", fileOperation);
  ctx.body = {
    data: (0, _presenters.presentFileOperation)(fileOperation)
  };
});
router.post("fileOperations.list", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _pagination.default)(), (0, _validate.default)(T.FileOperationsListSchema), async ctx => {
  const {
    direction,
    sort,
    type
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const where = {
    teamId: user.teamId,
    type
  };
  const team = await _models.Team.findByPk(user.teamId);
  (0, _policies.authorize)(user, "update", team);
  const [exports, total] = await Promise.all([_models.FileOperation.findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.FileOperation.count({
    where
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: exports.map(_presenters.presentFileOperation)
  };
});
const handleFileOperationsRedirect = async ctx => {
  const id = ctx.input.body.id ?? ctx.input.query.id;
  const {
    user
  } = ctx.state.auth;
  const fileOperation = await _models.FileOperation.unscoped().findByPk(id, {
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", fileOperation);
  if (fileOperation.state !== "complete") {
    throw (0, _errors.ValidationError)(`${fileOperation.type} is not complete yet`);
  }
  const accessUrl = await _files.default.getSignedUrl(fileOperation.key);
  ctx.redirect(accessUrl);
};
router.get("fileOperations.redirect", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.FileOperationsRedirectSchema), handleFileOperationsRedirect);
router.post("fileOperations.redirect", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.FileOperationsRedirectSchema), handleFileOperationsRedirect);
router.post("fileOperations.delete", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.FileOperationsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const fileOperation = await _models.FileOperation.unscoped().findByPk(id, {
    rejectOnEmpty: true,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", fileOperation);
  await fileOperation.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;