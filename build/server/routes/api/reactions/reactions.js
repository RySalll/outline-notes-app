"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("reactions.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.ReactionsListSchema), async ctx => {
  const {
    commentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const comment = await _models.Comment.findByPk(commentId, {
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(comment.documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "readReaction", comment);
  (0, _policies.authorize)(user, "read", document);
  const where = {
    commentId
  };
  const include = [{
    model: _models.User,
    required: true
  }];
  const [reactions, total] = await Promise.all([_models.Reaction.findAll({
    where,
    include,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Reaction.count({
    where,
    include
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: reactions.map(_presenters.presentReaction)
  };
});
var _default = exports.default = router;