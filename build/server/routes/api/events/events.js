"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _EventHelper = require("./../../../../shared/utils/EventHelper");
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
router.post("events.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.EventsListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    sort,
    direction,
    actorId,
    documentId,
    collectionId,
    name,
    auditLog
  } = ctx.input.body;
  let where = {
    name: _EventHelper.EventHelper.ACTIVITY_EVENTS,
    teamId: user.teamId
  };
  if (actorId) {
    where = {
      ...where,
      actorId
    };
  }
  if (documentId) {
    where = {
      ...where,
      documentId
    };
  }
  if (auditLog) {
    (0, _policies.authorize)(user, "audit", user.team);
    where.name = _EventHelper.EventHelper.AUDIT_EVENTS;
  }
  if (name && where.name.includes(name)) {
    where.name = name;
  }
  if (collectionId) {
    where = {
      ...where,
      collectionId
    };
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    (0, _policies.authorize)(user, "read", collection);
  } else {
    const collectionIds = await user.collectionIds({
      paranoid: false
    });
    where = {
      ...where,
      [_sequelize.Op.or]: [{
        collectionId: collectionIds
      }, {
        collectionId: {
          [_sequelize.Op.is]: null
        }
      }]
    };
  }
  const events = await _models.Event.findAll({
    where,
    order: [[sort, direction]],
    include: [{
      model: _models.User,
      as: "actor",
      paranoid: false
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: await Promise.all(events.map(event => (0, _presenters.presentEvent)(event, auditLog)))
  };
});
var _default = exports.default = router;