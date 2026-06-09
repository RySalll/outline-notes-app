"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _presenters = require("./../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("searches.list", (0, _authentication.default)(), (0, _validate.default)(T.SearchesListSchema), (0, _pagination.default)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const source = ctx.input.body?.source;
  const searches = await _models.SearchQuery.findAll({
    where: {
      ...(source ? {
        source
      } : {}),
      teamId: user.teamId,
      userId: user.id
    },
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: searches.map(_presenters.presentSearchQuery)
  };
});
router.post("searches.update", (0, _authentication.default)(), (0, _validate.default)(T.SearchesUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    score
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const search = await _models.SearchQuery.findOne({
    where: {
      id,
      userId: user.id
    },
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true,
    transaction
  });
  search.score = score;
  await search.save({
    transaction
  });
  ctx.body = {
    data: (0, _presenters.presentSearchQuery)(search)
  };
});
router.post("searches.delete", (0, _authentication.default)(), (0, _validate.default)(T.SearchesDeleteSchema), async ctx => {
  const {
    id,
    query
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  await _models.SearchQuery.destroy({
    where: {
      ...(id ? {
        id
      } : {
        query
      }),
      userId: user.id
    }
  });
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;