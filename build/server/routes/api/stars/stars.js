"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _starCreator = _interopRequireDefault(require("./../../../commands/starCreator"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _indexing = require("./../../../utils/indexing");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("stars.create", (0, _authentication.default)(), (0, _validate.default)(T.StarsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    documentId,
    collectionId,
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "star", document);
  }
  if (collectionId) {
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId, {
      transaction
    });
    (0, _policies.authorize)(user, "star", collection);
  }
  const star = await (0, _starCreator.default)({
    ctx,
    user,
    documentId,
    collectionId,
    index
  });
  ctx.body = {
    data: (0, _presenters.presentStar)(star),
    policies: (0, _presenters.presentPolicies)(user, [star])
  };
});
router.post("stars.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.StarsListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const [stars, collectionIds] = await Promise.all([_models.Star.findAll({
    where: {
      userId: user.id
    },
    order: [_sequelize.Sequelize.literal('"star"."index" collate "C"'), ["updatedAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), user.collectionIds()]);
  const nullIndex = stars.findIndex(star => star.index === null);
  if (nullIndex !== -1) {
    const indexedStars = await (0, _indexing.starIndexing)(user.id);
    stars.forEach(star => {
      star.index = indexedStars[star.id];
    });
  }
  const documentIds = stars.map(star => star.documentId).filter(Boolean);
  const documents = documentIds.length ? await _models.Document.defaultScopeWithUser(user.id).findAll({
    where: {
      id: documentIds,
      collectionId: collectionIds
    }
  }) : [];
  const policies = (0, _presenters.presentPolicies)(user, [...documents, ...stars]);
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      stars: stars.map(_presenters.presentStar),
      documents: await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)))
    },
    policies
  };
});
router.post("stars.update", (0, _authentication.default)(), (0, _validate.default)(T.StarsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const star = await _models.Star.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "update", star);
  await star.updateWithCtx(ctx, {
    index
  });
  ctx.body = {
    data: (0, _presenters.presentStar)(star),
    policies: (0, _presenters.presentPolicies)(user, [star])
  };
});
router.post("stars.delete", (0, _authentication.default)(), (0, _validate.default)(T.StarsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const star = await _models.Star.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", star);
  await star.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;