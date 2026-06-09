"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _constants = require("./../../../../shared/constants");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _RateLimiter = require("./../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("groups.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.GroupsListSchema), async ctx => {
  const {
    sort,
    direction,
    query,
    userId,
    externalId,
    name
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "listGroups", user.team);
  let where = {
    teamId: user.teamId
  };
  if (name) {
    where = {
      ...where,
      name: {
        [_sequelize.Op.eq]: name
      }
    };
  } else if (query) {
    where = {
      ...where,
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (externalId) {
    where = {
      ...where,
      externalId
    };
  }
  const groups = await _models.Group.filterByMember(userId).findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      groups: await Promise.all(groups.map(_presenters.presentGroup)),
      // TODO: Deprecated, will remove in the future as language conflicts with GroupMembership
      groupMemberships: (await Promise.all(groups.map(group => _models.GroupUser.findAll({
        where: {
          groupId: group.id
        },
        limit: _constants.MAX_AVATAR_DISPLAY
      })))).flat().filter(groupUser => groupUser.user).map(groupUser => (0, _presenters.presentGroupUser)(groupUser, {
        includeUser: true
      }))
    },
    policies: (0, _presenters.presentPolicies)(user, groups)
  };
});
router.post("groups.info", (0, _authentication.default)(), (0, _validate.default)(T.GroupsInfoSchema), async ctx => {
  const {
    id,
    externalId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const group = id ? await _models.Group.findByPk(id) : externalId ? await _models.Group.findOne({
    where: {
      externalId
    }
  }) : null;
  (0, _policies.authorize)(user, "read", group);
  ctx.body = {
    data: await (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerMinute), (0, _authentication.default)(), (0, _validate.default)(T.GroupsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    externalId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createGroup", user.team);
  const group = await _models.Group.createWithCtx(ctx, {
    name,
    externalId,
    teamId: user.teamId,
    createdById: user.id
  });
  ctx.body = {
    data: await (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.update", (0, _authentication.default)(), (0, _validate.default)(T.GroupsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const group = await _models.Group.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "update", group);
  await group.updateWithCtx(ctx, ctx.input.body);
  ctx.body = {
    data: await (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.delete", (0, _authentication.default)(), (0, _validate.default)(T.GroupsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const group = await _models.Group.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", group);
  await group.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("groups.memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.GroupsMembershipsSchema), async ctx => {
  const {
    id,
    query
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const group = await _models.Group.findByPk(id);
  (0, _policies.authorize)(user, "read", group);
  let userWhere;
  if (query) {
    userWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  const options = {
    where: {
      groupId: id
    },
    include: [{
      model: _models.User,
      as: "user",
      where: userWhere,
      required: true
    }]
  };
  const [total, groupUsers] = await Promise.all([_models.GroupUser.count(options), _models.GroupUser.findAll({
    ...options,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: {
      groupMemberships: groupUsers.map(groupUser => (0, _presenters.presentGroupUser)(groupUser, {
        includeUser: true
      })),
      users: groupUsers.map(groupUser => (0, _presenters.presentUser)(groupUser.user))
    }
  };
});
router.post("groups.add_user", (0, _authentication.default)(), (0, _validate.default)(T.GroupsAddUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    userId
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const {
    transaction
  } = ctx.state;
  const user = await _models.User.findByPk(userId, {
    transaction
  });
  (0, _policies.authorize)(actor, "read", user);
  const group = await _models.Group.findByPk(id, {
    transaction
  });
  (0, _policies.authorize)(actor, "update", group);
  const [groupUser] = await _models.GroupUser.findOrCreateWithCtx(ctx, {
    where: {
      groupId: group.id,
      userId: user.id
    },
    defaults: {
      createdById: actor.id
    }
  }, {
    name: "add_user"
  });
  groupUser.user = user;
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      groupMemberships: [(0, _presenters.presentGroupUser)(groupUser, {
        includeUser: true
      })],
      groups: [await (0, _presenters.presentGroup)(group)]
    }
  };
});
router.post("groups.remove_user", (0, _authentication.default)(), (0, _validate.default)(T.GroupsRemoveUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    userId
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const {
    transaction
  } = ctx.state;
  const group = await _models.Group.findByPk(id, {
    transaction
  });
  (0, _policies.authorize)(actor, "update", group);
  const user = await _models.User.findByPk(userId, {
    transaction
  });
  (0, _policies.authorize)(actor, "read", user);
  const groupUser = await _models.GroupUser.unscoped().findOne({
    where: {
      groupId: group.id,
      userId: user.id
    },
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  await groupUser?.destroyWithCtx(ctx, {
    name: "remove_user"
  });
  ctx.body = {
    data: {
      groups: [await (0, _presenters.presentGroup)(group)]
    }
  };
});
var _default = exports.default = router;