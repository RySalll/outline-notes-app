"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _pinCreator = _interopRequireDefault(require("./../../../commands/pinCreator"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
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
router.post("pins.create", (0, _authentication.default)(), (0, _validate.default)(T.PinsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    documentId,
    collectionId,
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "read", document);
  if (collectionId) {
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId, {
      transaction
    });
    (0, _policies.authorize)(user, "update", collection);
    (0, _policies.authorize)(user, "pin", document);
  } else {
    (0, _policies.authorize)(user, "pinToHome", document);
  }
  const pin = await (0, _pinCreator.default)({
    ctx,
    user,
    documentId,
    collectionId,
    index
  });
  ctx.body = {
    data: (0, _presenters.presentPin)(pin),
    policies: (0, _presenters.presentPolicies)(user, [pin])
  };
});
router.post("pins.list", (0, _authentication.default)(), (0, _validate.default)(T.PinsListSchema), (0, _pagination.default)(), async ctx => {
  const {
    collectionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const [pins, collectionIds] = await Promise.all([_models.Pin.findAll({
    where: {
      ...(collectionId ? {
        collectionId
      } : {
        collectionId: {
          [_sequelize.Op.is]: null
        }
      }),
      teamId: user.teamId
    },
    order: [_sequelize.Sequelize.literal('"pin"."index" collate "C"'), ["updatedAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), user.collectionIds()]);
  const documents = await _models.Document.defaultScopeWithUser(user.id).findAll({
    where: {
      id: pins.map(pin => pin.documentId),
      collectionId: collectionIds
    }
  });
  const policies = (0, _presenters.presentPolicies)(user, [...documents, ...pins]);
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      pins: pins.map(_presenters.presentPin),
      documents: await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)))
    },
    policies
  };
});
router.post("pins.update", (0, _authentication.default)(), (0, _validate.default)(T.PinsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
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
  const pin = await _models.Pin.findByPk(id, {
    transaction,
    lock: _sequelize.Transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(pin.documentId, {
    userId: user.id,
    transaction
  });
  if (pin.collectionId) {
    (0, _policies.authorize)(user, "pin", document);
  } else {
    (0, _policies.authorize)(user, "update", pin);
  }
  await pin.updateWithCtx(ctx, {
    index
  });
  ctx.body = {
    data: (0, _presenters.presentPin)(pin),
    policies: (0, _presenters.presentPolicies)(user, [pin])
  };
});
router.post("pins.delete", (0, _authentication.default)(), (0, _validate.default)(T.PinsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const pin = await _models.Pin.findByPk(id, {
    transaction,
    lock: _sequelize.Transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(pin.documentId, {
    userId: user.id,
    transaction
  });
  if (pin.collectionId) {
    (0, _policies.authorize)(user, "unpin", document);
  } else {
    (0, _policies.authorize)(user, "delete", pin);
  }
  await pin.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;