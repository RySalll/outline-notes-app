"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _invariant = _interopRequireDefault(require("invariant"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _types = require("./../../../../shared/types");
var _collectionDestroyer = _interopRequireDefault(require("./../../../commands/collectionDestroyer"));
var _collectionExporter = _interopRequireDefault(require("./../../../commands/collectionExporter"));
var _teamUpdater = _interopRequireDefault(require("./../../../commands/teamUpdater"));
var _editor = require("./../../../editor");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _DocumentHelper = require("./../../../models/helpers/DocumentHelper");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _RateLimiter = require("./../../../utils/RateLimiter");
var _indexing = require("./../../../utils/indexing");
var _removeIndexCollision = _interopRequireDefault(require("./../../../utils/removeIndexCollision"));
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("collections.create", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    name,
    color,
    description,
    data,
    permission,
    sharing,
    icon,
    sort
  } = ctx.input.body;
  let {
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createCollection", user.team);
  if (index) {
    index = await (0, _removeIndexCollision.default)(user.teamId, index, {
      transaction
    });
  } else {
    const first = await _models.Collection.findFirstCollectionForUser(user, {
      attributes: ["id", "index"],
      transaction
    });
    index = (0, _fractionalIndex.default)(null, first ? first.index : null);
  }
  const collection = _models.Collection.build({
    name,
    content: data,
    description: data ? undefined : description,
    icon,
    color,
    teamId: user.teamId,
    createdById: user.id,
    permission,
    sharing,
    sort,
    index
  });
  if (data) {
    collection.description = _DocumentHelper.DocumentHelper.toMarkdown(collection);
  }
  await collection.save({
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "collections.create",
    collectionId: collection.id,
    data: {
      name
    }
  });
  // we must reload the collection to get memberships for policy presenter
  const reloaded = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(collection.id, {
    transaction
  });
  (0, _invariant.default)(reloaded, "collection not found");
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, reloaded),
    policies: (0, _presenters.presentPolicies)(user, [reloaded])
  };
});
router.post("collections.info", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope([{
    method: ["withMembership", user.id]
  }, "withArchivedBy"]).findByPk(id);
  (0, _policies.authorize)(user, "read", collection);
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.documents", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsDocumentsSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  (0, _policies.authorize)(user, "readDocument", collection);
  ctx.body = {
    data: collection.documentStructure || []
  };
});
router.post("collections.import", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _authentication.default)(), (0, _validate.default)(T.CollectionsImportSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    attachmentId,
    permission,
    format
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "importCollection", user.team);
  const attachment = await _models.Attachment.findByPk(attachmentId, {
    transaction
  });
  (0, _policies.authorize)(user, "read", attachment);
  await _models.FileOperation.createWithCtx(ctx, {
    type: _types.FileOperationType.Import,
    state: _types.FileOperationState.Creating,
    format,
    size: attachment.size,
    key: attachment.key,
    userId: user.id,
    teamId: user.teamId,
    options: {
      permission
    }
  });
  ctx.body = {
    success: true
  };
});
router.post("collections.add_group", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsAddGroupSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    groupId,
    permission
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const [collection, group] = await Promise.all([_models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id, {
    transaction
  }), _models.Group.findByPk(groupId, {
    transaction
  })]);
  (0, _policies.authorize)(user, "update", collection);
  (0, _policies.authorize)(user, "read", group);
  const [membership, created] = await _models.GroupMembership.findOrCreate({
    where: {
      collectionId: id,
      groupId
    },
    defaults: {
      permission,
      createdById: user.id
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (!created) {
    membership.permission = permission;
    await membership.save(ctx.context);
  }
  const groupMemberships = [(0, _presenters.presentGroupMembership)(membership)];
  ctx.body = {
    data: {
      groupMemberships
    }
  };
});
router.post("collections.remove_group", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsRemoveGroupSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    groupId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const [collection, group] = await Promise.all([_models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id, {
    transaction
  }), _models.Group.findByPk(groupId, {
    transaction
  })]);
  (0, _policies.authorize)(user, "update", collection);
  (0, _policies.authorize)(user, "read", group);
  const [membership] = await collection.$get("groupMemberships", {
    where: {
      groupId
    },
    transaction
  });
  if (!membership) {
    ctx.throw(400, "This Group is not a part of the collection");
  }
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("collections.group_memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.CollectionsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  (0, _policies.authorize)(user, "read", collection);
  let where = {
    collectionId: id
  };
  let groupWhere;
  if (query) {
    groupWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (permission) {
    where = {
      ...where,
      permission
    };
  }
  const options = {
    where,
    include: [{
      model: _models.Group,
      as: "group",
      where: groupWhere,
      required: true
    }]
  };
  const [total, memberships] = await Promise.all([_models.GroupMembership.count(options), _models.GroupMembership.findAll({
    ...options,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  })]);
  const groupMemberships = memberships.map(_presenters.presentGroupMembership);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: {
      groupMemberships,
      groups: await Promise.all(memberships.map(membership => (0, _presenters.presentGroup)(membership.group)))
    }
  };
});
router.post("collections.add_user", (0, _authentication.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _validate.default)(T.CollectionsAddUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user: actor
  } = ctx.state.auth;
  const {
    id,
    userId,
    permission
  } = ctx.input.body;
  const [collection, user] = await Promise.all([_models.Collection.scope({
    method: ["withMembership", actor.id]
  }).findByPk(id, {
    transaction
  }), _models.User.findByPk(userId, {
    transaction
  })]);
  (0, _policies.authorize)(actor, "update", collection);
  (0, _policies.authorize)(actor, "read", user);
  const [membership, isNew] = await _models.UserMembership.findOrCreate({
    where: {
      collectionId: id,
      userId
    },
    defaults: {
      permission: permission || user.defaultCollectionPermission,
      createdById: actor.id
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (!isNew && permission) {
    membership.permission = permission;
    await membership.save(ctx.context);
  }
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      memberships: [(0, _presenters.presentMembership)(membership)]
    }
  };
});
router.post("collections.remove_user", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsRemoveUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user: actor
  } = ctx.state.auth;
  const {
    id,
    userId
  } = ctx.input.body;
  const [collection, user] = await Promise.all([_models.Collection.scope({
    method: ["withMembership", actor.id]
  }).findByPk(id, {
    transaction
  }), _models.User.findByPk(userId, {
    transaction
  })]);
  (0, _policies.authorize)(actor, "update", collection);
  (0, _policies.authorize)(actor, "read", user);
  const [membership] = await collection.$get("memberships", {
    where: {
      userId
    },
    transaction
  });
  if (!membership) {
    ctx.throw(400, "User is not a collection member");
  }
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("collections.memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.CollectionsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  (0, _policies.authorize)(user, "read", collection);
  let where = {
    collectionId: id
  };
  let userWhere;
  if (query) {
    userWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (permission) {
    where = {
      ...where,
      permission
    };
  }
  const options = {
    where,
    include: [{
      model: _models.User,
      as: "user",
      where: userWhere,
      required: true
    }]
  };
  const [total, memberships] = await Promise.all([_models.UserMembership.count(options), _models.UserMembership.findAll({
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
      memberships: memberships.map(_presenters.presentMembership),
      users: memberships.map(membership => (0, _presenters.presentUser)(membership.user))
    }
  };
});
router.post("collections.export", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FiftyPerHour), (0, _authentication.default)(), (0, _validate.default)(T.CollectionsExportSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    format,
    includeAttachments
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const team = await _models.Team.findByPk(user.teamId, {
    transaction
  });
  (0, _policies.authorize)(user, "createExport", team);
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id, {
    transaction
  });
  (0, _policies.authorize)(user, "export", collection);
  const fileOperation = await (0, _collectionExporter.default)({
    collection,
    user,
    team,
    format,
    includeAttachments,
    ctx
  });
  ctx.body = {
    success: true,
    data: {
      fileOperation: (0, _presenters.presentFileOperation)(fileOperation)
    }
  };
});
router.post("collections.export_all", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)(), (0, _validate.default)(T.CollectionsExportAllSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    format,
    includeAttachments
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const team = await _models.Team.findByPk(user.teamId, {
    transaction
  });
  (0, _policies.authorize)(user, "createExport", team);
  const fileOperation = await (0, _collectionExporter.default)({
    user,
    team,
    format,
    includeAttachments,
    ctx
  });
  ctx.body = {
    success: true,
    data: {
      fileOperation: (0, _presenters.presentFileOperation)(fileOperation)
    }
  };
});
router.post("collections.update", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    name,
    description,
    data,
    icon,
    permission,
    color,
    sort,
    sharing
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id, {
    transaction
  });
  (0, _policies.authorize)(user, "update", collection);

  // we're making this collection have no default access, ensure that the
  // current user has an admin membership so that at least they can manage it.
  if (permission !== _types.CollectionPermission.ReadWrite && collection.permission === _types.CollectionPermission.ReadWrite) {
    await _models.UserMembership.findOrCreate({
      where: {
        collectionId: collection.id,
        userId: user.id
      },
      defaults: {
        permission: _types.CollectionPermission.Admin,
        createdById: user.id
      },
      transaction
    });
  }
  let privacyChanged = false;
  let sharingChanged = false;
  if (name !== undefined) {
    collection.name = name.trim();
  }
  if (description !== undefined) {
    collection.description = description;
    collection.content = description ? _editor.parser.parse(description)?.toJSON() : null;
  }
  if (data !== undefined) {
    collection.content = data;
    collection.description = _DocumentHelper.DocumentHelper.toMarkdown(collection);
  }
  if (icon !== undefined) {
    collection.icon = icon;
  }
  if (color !== undefined) {
    collection.color = color;
  }
  if (permission !== undefined) {
    privacyChanged = permission !== collection.permission;
    collection.permission = permission ? permission : null;
  }
  if (sharing !== undefined) {
    sharingChanged = sharing !== collection.sharing;
    collection.sharing = sharing;
  }
  if (sort !== undefined) {
    collection.sort = sort;
  }
  await collection.save({
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "collections.update",
    collectionId: collection.id,
    data: {
      name
    }
  });
  if (privacyChanged || sharingChanged) {
    await _models.Event.createFromContext(ctx, {
      name: "collections.permission_changed",
      collectionId: collection.id,
      data: {
        privacyChanged,
        sharingChanged
      }
    });
  }

  // must reload to update collection membership for correct policy calculation
  // if the privacy level has changed. Otherwise skip this query for speed.
  if (privacyChanged || sharingChanged) {
    await collection.reload({
      transaction
    });
    const team = await _models.Team.findByPk(user.teamId, {
      transaction,
      rejectOnEmpty: true
    });
    if (collection.permission === null && team?.defaultCollectionId === collection.id) {
      await (0, _teamUpdater.default)({
        params: {
          defaultCollectionId: null
        },
        ip: ctx.request.ip,
        user,
        team,
        transaction
      });
    }
  }
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.list", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsListSchema), (0, _pagination.default)(), (0, _transaction.transaction)(), async ctx => {
  const {
    includeListOnly,
    statusFilter
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const collectionIds = await user.collectionIds({
    transaction
  });
  const where = {
    teamId: user.teamId,
    [_sequelize.Op.and]: [{
      deletedAt: {
        [_sequelize.Op.eq]: null
      }
    }]
  };
  if (!statusFilter) {
    where[_sequelize.Op.and].push({
      archivedAt: {
        [_sequelize.Op.eq]: null
      }
    });
  }
  if (!includeListOnly || !user.isAdmin) {
    where[_sequelize.Op.and].push({
      id: collectionIds
    });
  }
  const statusQuery = [];
  if (statusFilter?.includes(_types.CollectionStatusFilter.Archived)) {
    statusQuery.push({
      archivedAt: {
        [_sequelize.Op.ne]: null
      }
    });
  }
  if (statusQuery.length) {
    where[_sequelize.Op.and].push({
      [_sequelize.Op.or]: statusQuery
    });
  }
  const [collections, total] = await Promise.all([_models.Collection.scope(statusFilter?.includes(_types.CollectionStatusFilter.Archived) ? [{
    method: ["withMembership", user.id]
  }, "withArchivedBy"] : {
    method: ["withMembership", user.id]
  }).findAll({
    where,
    order: [_sequelize.Sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit,
    transaction
  }), _models.Collection.count({
    where,
    transaction
  })]);
  const nullIndex = collections.findIndex(collection => collection.index === null);
  if (nullIndex !== -1) {
    const indexedCollections = await (0, _indexing.collectionIndexing)(user.teamId, {
      transaction
    });
    collections.forEach(collection => {
      collection.index = indexedCollections[collection.id];
    });
  }
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: await Promise.all(collections.map(collection => (0, _presenters.presentCollection)(ctx, collection))),
    policies: (0, _presenters.presentPolicies)(user, collections)
  };
});
router.post("collections.delete", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id, {
    transaction
  });
  (0, _policies.authorize)(user, "delete", collection);
  await (0, _collectionDestroyer.default)({
    collection,
    transaction,
    user,
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("collections.archive", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsArchiveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope([{
    method: ["withMembership", user.id]
  }]).findByPk(id, {
    transaction,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "archive", collection);
  collection.archivedAt = new Date();
  collection.archivedById = user.id;
  await collection.save({
    transaction
  });
  collection.archivedBy = user;

  // Archive all documents within the collection
  await _models.Document.update({
    lastModifiedById: user.id,
    archivedAt: collection.archivedAt
  }, {
    where: {
      teamId: collection.teamId,
      collectionId: collection.id,
      archivedAt: {
        [_sequelize.Op.is]: null
      }
    },
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "collections.archive",
    collectionId: collection.id,
    data: {
      name: collection.name,
      archivedAt: collection.archivedAt
    }
  });
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.restore", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsRestoreSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id, {
    transaction,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "restore", collection);
  const collectionArchivedAt = collection.archivedAt;
  await _models.Document.update({
    lastModifiedById: user.id,
    archivedAt: null
  }, {
    where: {
      collectionId: collection.id,
      teamId: user.teamId,
      archivedAt: collection.archivedAt
    },
    transaction
  });
  collection.archivedAt = null;
  collection.archivedById = null;
  await collection.save({
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "collections.restore",
    collectionId: collection.id,
    data: {
      name: collection.name,
      archivedAt: collectionArchivedAt
    }
  });
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.move", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsMoveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  let {
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "move", collection);
  index = await (0, _removeIndexCollision.default)(user.teamId, index, {
    transaction
  });
  await collection.update({
    index
  }, {
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "collections.move",
    collectionId: collection.id,
    data: {
      index
    }
  });
  ctx.body = {
    success: true,
    data: {
      index
    }
  };
});
var _default = exports.default = router;