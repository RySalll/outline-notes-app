"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _uniqBy = _interopRequireDefault(require("lodash/uniqBy"));
var _sequelize = require("sequelize");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _presenters = require("./../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("groupMemberships.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.GroupMembershipsListSchema), async ctx => {
  const {
    groupId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const memberships = await _models.GroupMembership.findAll({
    where: {
      documentId: {
        [_sequelize.Op.ne]: null
      },
      sourceId: {
        [_sequelize.Op.eq]: null
      }
    },
    include: [{
      association: "group",
      required: true,
      where: groupId ? {
        id: groupId
      } : undefined,
      include: [{
        association: "groupUsers",
        required: true,
        where: {
          userId: user.id
        }
      }]
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const documentIds = memberships.map(p => p.documentId).filter(Boolean);
  const documents = await _models.Document.scope(["withDrafts", {
    method: ["withMembership", user.id]
  }, {
    method: ["withCollectionPermissions", user.id]
  }]).findAll({
    where: {
      id: documentIds
    }
  });
  const groups = (0, _uniqBy.default)(memberships.map(membership => membership.group), "id");
  const policies = (0, _presenters.presentPolicies)(user, [...documents, ...memberships, ...groups]);
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      groups: await Promise.all(groups.map(_presenters.presentGroup)),
      groupMemberships: memberships.map(_presenters.presentGroupMembership),
      documents: await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)))
    },
    policies
  };
});
var _default = exports.default = router;