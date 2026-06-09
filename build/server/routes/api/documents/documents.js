"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _invariant = _interopRequireDefault(require("invariant"));
var _jszip = _interopRequireDefault(require("jszip"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _has = _interopRequireDefault(require("lodash/has"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _remove = _interopRequireDefault(require("lodash/remove"));
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _sequelize = require("sequelize");
var _uuid = require("uuid");
var _types = require("./../../../../shared/types");
var _date = require("./../../../../shared/utils/date");
var _slugify = _interopRequireDefault(require("./../../../../shared/utils/slugify"));
var _documentCreator = _interopRequireDefault(require("./../../../commands/documentCreator"));
var _documentDuplicator = _interopRequireDefault(require("./../../../commands/documentDuplicator"));
var _documentLoader = _interopRequireDefault(require("./../../../commands/documentLoader"));
var _documentMover = _interopRequireDefault(require("./../../../commands/documentMover"));
var _documentPermanentDeleter = _interopRequireDefault(require("./../../../commands/documentPermanentDeleter"));
var _documentUpdater = _interopRequireDefault(require("./../../../commands/documentUpdater"));
var _env = _interopRequireDefault(require("./../../../env"));
var _errors = require("./../../../errors");
var _Logger = _interopRequireDefault(require("./../../../logging/Logger"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _multipart = _interopRequireDefault(require("./../../../middlewares/multipart"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _AttachmentHelper = _interopRequireDefault(require("./../../../models/helpers/AttachmentHelper"));
var _DocumentHelper = require("./../../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("./../../../models/helpers/ProsemirrorHelper");
var _SearchHelper = _interopRequireDefault(require("./../../../models/helpers/SearchHelper"));
var _TextHelper = require("./../../../models/helpers/TextHelper");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _DocumentImportTask = _interopRequireDefault(require("./../../../queues/tasks/DocumentImportTask"));
var _EmptyTrashTask = _interopRequireDefault(require("./../../../queues/tasks/EmptyTrashTask"));
var _files = _interopRequireDefault(require("./../../../storage/files"));
var _RateLimiter = require("./../../../utils/RateLimiter");
var _ZipHelper = _interopRequireDefault(require("./../../../utils/ZipHelper"));
var _passport = require("./../../../utils/passport");
var _validation = require("./../../../validation");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("documents.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsListSchema), async ctx => {
  const {
    sort,
    direction,
    template,
    collectionId,
    backlinkDocumentId,
    parentDocumentId,
    userId: createdById,
    statusFilter
  } = ctx.input.body;

  // always filter by the current team
  const {
    user
  } = ctx.state.auth;
  const where = {
    teamId: user.teamId,
    [_sequelize.Op.and]: [{
      deletedAt: {
        [_sequelize.Op.eq]: null
      }
    }]
  };

  // Exclude archived docs by default
  if (!statusFilter) {
    where[_sequelize.Op.and].push({
      archivedAt: {
        [_sequelize.Op.eq]: null
      }
    });
  }
  if (template) {
    where[_sequelize.Op.and].push({
      template: true
    });
  }

  // if a specific user is passed then add to filters. If the user doesn't
  // exist in the team then nothing will be returned, so no need to check auth
  if (createdById) {
    where[_sequelize.Op.and].push({
      createdById
    });
  }
  let documentIds = [];

  // if a specific collection is passed then we need to check auth to view it
  if (collectionId) {
    where[_sequelize.Op.and].push({
      collectionId: [collectionId]
    });
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    (0, _policies.authorize)(user, "readDocument", collection);

    // index sort is special because it uses the order of the documents in the
    // collection.documentStructure rather than a database column
    if (sort === "index") {
      documentIds = (collection?.documentStructure || []).map(node => node.id).slice(ctx.state.pagination.offset, ctx.state.pagination.limit);
      where[_sequelize.Op.and].push({
        id: documentIds
      });
    } // if it's not a backlink request, filter by all collections the user has access to
  } else if (!backlinkDocumentId) {
    const collectionIds = await user.collectionIds();
    where[_sequelize.Op.and].push({
      collectionId: template && (0, _policies.can)(user, "readTemplate", user.team) ? {
        [_sequelize.Op.or]: [{
          [_sequelize.Op.in]: collectionIds
        }, {
          [_sequelize.Op.is]: null
        }]
      } : collectionIds
    });
  }
  if (parentDocumentId) {
    const [groupMembership, membership] = await Promise.all([_models.GroupMembership.findOne({
      where: {
        documentId: parentDocumentId
      },
      include: [{
        model: _models.Group,
        required: true,
        include: [{
          model: _models.GroupUser,
          required: true,
          where: {
            userId: user.id
          }
        }]
      }]
    }), _models.UserMembership.findOne({
      where: {
        userId: user.id,
        documentId: parentDocumentId
      }
    })]);
    if (groupMembership || membership) {
      (0, _remove.default)(where[_sequelize.Op.and], cond => (0, _has.default)(cond, "collectionId"));
    }
    where[_sequelize.Op.and].push({
      parentDocumentId
    });
  }

  // Explicitly passing 'null' as the parentDocumentId allows listing documents
  // that have no parent document (aka they are at the root of the collection)
  if (parentDocumentId === null) {
    where[_sequelize.Op.and].push({
      parentDocumentId: {
        [_sequelize.Op.is]: null
      }
    });
  }
  if (backlinkDocumentId) {
    const sourceDocumentIds = await _models.Backlink.findSourceDocumentIdsForUser(backlinkDocumentId, user);
    where[_sequelize.Op.and].push({
      id: sourceDocumentIds
    });

    // For safety, ensure the collectionId is not set in the query.
    (0, _remove.default)(where[_sequelize.Op.and], cond => (0, _has.default)(cond, "collectionId"));
  }
  const statusQuery = [];
  if (statusFilter?.includes(_types.StatusFilter.Published)) {
    statusQuery.push({
      [_sequelize.Op.and]: [{
        publishedAt: {
          [_sequelize.Op.ne]: null
        },
        archivedAt: {
          [_sequelize.Op.eq]: null
        }
      }]
    });
  }
  if (statusFilter?.includes(_types.StatusFilter.Draft)) {
    statusQuery.push({
      [_sequelize.Op.and]: [{
        publishedAt: {
          [_sequelize.Op.eq]: null
        },
        archivedAt: {
          [_sequelize.Op.eq]: null
        },
        [_sequelize.Op.or]: [
        // Only ever include draft results for the user's own documents
        {
          createdById: user.id
        }, {
          "$memberships.id$": {
            [_sequelize.Op.ne]: null
          }
        }]
      }]
    });
  }
  if (statusFilter?.includes(_types.StatusFilter.Archived)) {
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
  const [documents, total] = await Promise.all([_models.Document.defaultScopeWithUser(user.id).findAll({
    where,
    order: [[
    // this needs to be done otherwise findAll will throw citing
    // that the column "document"."index" doesn't exist – value of sort
    // is required to be a column name
    sort === "index" ? "updatedAt" : sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Document.count({
    where
  })]);
  if (sort === "index") {
    // sort again so as to retain the order of documents as in collection.documentStructure
    documents.sort((a, b) => documentIds.indexOf(a.id) - documentIds.indexOf(b.id));
  }
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data,
    policies
  };
});
router.post("documents.archived", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsArchivedSchema), async ctx => {
  const {
    sort,
    direction,
    collectionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  let where = {
    teamId: user.teamId,
    archivedAt: {
      [_sequelize.Op.ne]: null
    }
  };
  let documentIds = [];

  // if a specific collection is passed then we need to check auth to view it
  if (collectionId) {
    where = {
      ...where,
      collectionId
    };
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    (0, _policies.authorize)(user, "readDocument", collection);

    // index sort is special because it uses the order of the documents in the
    // collection.documentStructure rather than a database column
    if (sort === "index") {
      documentIds = (collection?.documentStructure || []).map(node => node.id).slice(ctx.state.pagination.offset, ctx.state.pagination.limit);
      where = {
        ...where,
        id: documentIds
      };
    } // otherwise, filter by all collections the user has access to
  } else {
    const collectionIds = await user.collectionIds();
    where = {
      ...where,
      collectionId: collectionIds
    };
  }
  const documents = await _models.Document.defaultScopeWithUser(user.id).findAll({
    where,
    order: [[
    // this needs to be done otherwise findAll will throw citing
    // that the column "document"."index" doesn't exist – value of sort
    // is required to be a column name
    sort === "index" ? "updatedAt" : sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  if (sort === "index") {
    // sort again so as to retain the order of documents as in collection.documentStructure
    documents.sort((a, b) => documentIds.indexOf(a.id) - documentIds.indexOf(b.id));
  }
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.deleted", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsDeletedSchema), async ctx => {
  const {
    sort,
    direction
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collectionIds = await user.collectionIds({
    paranoid: false
  });
  const membershipScope = {
    method: ["withMembership", user.id]
  };
  const collectionScope = {
    method: ["withCollectionPermissions", user.id]
  };
  const viewScope = {
    method: ["withViews", user.id]
  };
  const documents = await _models.Document.scope([membershipScope, collectionScope, viewScope, "withDrafts"]).findAll({
    where: {
      teamId: user.teamId,
      deletedAt: {
        [_sequelize.Op.ne]: null
      },
      [_sequelize.Op.or]: [{
        collectionId: {
          [_sequelize.Op.in]: collectionIds
        }
      }, {
        createdById: user.id,
        collectionId: {
          [_sequelize.Op.is]: null
        }
      }]
    },
    paranoid: false,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.viewed", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsViewedSchema), async ctx => {
  const {
    sort,
    direction
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collectionIds = await user.collectionIds();
  const userId = user.id;
  const views = await _models.View.findAll({
    where: {
      userId
    },
    order: [[sort, direction]],
    include: [{
      model: _models.Document.scope(["withDrafts", {
        method: ["withMembership", userId]
      }]),
      required: true,
      where: {
        collectionId: collectionIds
      },
      include: [{
        model: _models.Collection.scope({
          method: ["withMembership", userId]
        }),
        as: "collection"
      }]
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const documents = views.map(view => {
    const document = view.document;
    document.views = [view];
    return document;
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.drafts", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsDraftsSchema), async ctx => {
  const {
    collectionId,
    dateFilter,
    direction,
    sort
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (collectionId) {
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    (0, _policies.authorize)(user, "readDocument", collection);
  }
  const collectionIds = collectionId ? [collectionId] : await user.collectionIds();
  const where = {
    createdById: user.id,
    collectionId: {
      [_sequelize.Op.or]: [{
        [_sequelize.Op.in]: collectionIds
      }, {
        [_sequelize.Op.is]: null
      }]
    },
    publishedAt: {
      [_sequelize.Op.is]: null
    }
  };
  if (dateFilter) {
    where.updatedAt = {
      [_sequelize.Op.gte]: (0, _date.subtractDate)(new Date(), dateFilter)
    };
  } else {
    delete where.updatedAt;
  }
  const documents = await _models.Document.defaultScopeWithUser(user.id).findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.info", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.DocumentsInfoSchema), async ctx => {
  const {
    id,
    shareId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const apiVersion = getAPIVersion(ctx);
  const teamFromCtx = await (0, _passport.getTeamFromContext)(ctx);
  const {
    document,
    share,
    collection
  } = await (0, _documentLoader.default)({
    id,
    shareId,
    user,
    teamId: teamFromCtx?.id
  });
  const isPublic = (0, _policies.cannot)(user, "read", document);
  const [serializedDocument, team] = await Promise.all([(0, _presenters.presentDocument)(ctx, document, {
    isPublic,
    shareId
  }), teamFromCtx?.id === document.teamId ? teamFromCtx : document.$get("team")]);

  // Passing apiVersion=2 has a single effect, to change the response payload to
  // include top level keys for document, sharedTree, and team.
  const data = apiVersion >= 2 ? {
    document: serializedDocument,
    team: team ? (0, _presenters.presentPublicTeam)(team, !!team?.getPreference(_types.TeamPreference.PublicBranding)) : undefined,
    sharedTree: share && share.includeChildDocuments ? collection?.getDocumentTree(share.documentId) : null
  } : serializedDocument;
  ctx.body = {
    data,
    policies: isPublic ? undefined : (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.users", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsUsersSchema), async ctx => {
  const {
    id,
    userId,
    query
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const document = await _models.Document.findByPk(id, {
    userId: actor.id
  });
  (0, _policies.authorize)(actor, "read", document);
  let where = {
    teamId: document.teamId,
    suspendedAt: {
      [_sequelize.Op.is]: null
    }
  };
  const [collection, memberIds, collectionMemberIds] = await Promise.all([document.$get("collection"), _models.Document.membershipUserIds(document.id), document.collectionId ? _models.Collection.membershipUserIds(document.collectionId) : []]);
  where = {
    ...where,
    [_sequelize.Op.or]: [{
      id: {
        [_sequelize.Op.in]: (0, _uniq.default)([...memberIds, ...collectionMemberIds])
      }
    }, collection?.permission ? {
      role: {
        [_sequelize.Op.ne]: _types.UserRole.Guest
      }
    } : {}]
  };
  if (query) {
    where = {
      ...where,
      [_sequelize.Op.and]: [_sequelize.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`)]
    };
  }
  if (userId) {
    where = {
      ...where,
      id: userId
    };
  }
  const replacements = {
    query: `%${query}%`
  };
  const [users, total] = await Promise.all([_models.User.findAll({
    where,
    replacements,
    offset,
    limit
  }), _models.User.count({
    where,
    // @ts-expect-error Types are incorrect for count
    replacements
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: users.map(user => (0, _presenters.presentUser)(user)),
    policies: (0, _presenters.presentPolicies)(actor, users)
  };
});
router.post("documents.export", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.DocumentsExportSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const accept = ctx.request.headers["accept"];
  const {
    document
  } = await (0, _documentLoader.default)({
    id,
    user,
    // We need the collaborative state to generate HTML.
    includeState: !accept?.includes("text/markdown")
  });
  let contentType;
  let content;
  if (accept?.includes("text/html")) {
    contentType = "text/html";
    content = await _DocumentHelper.DocumentHelper.toHTML(document, {
      centered: true,
      includeMermaid: true
    });
  } else if (accept?.includes("application/pdf")) {
    throw (0, _errors.IncorrectEditionError)("PDF export is not available in the community edition");
  } else if (accept?.includes("text/markdown")) {
    contentType = "text/markdown";
    content = _DocumentHelper.DocumentHelper.toMarkdown(document);
  } else {
    ctx.body = {
      data: _DocumentHelper.DocumentHelper.toMarkdown(document)
    };
    return;
  }

  // Override the extension for Markdown as it's incorrect in the mime-types
  // library until a new release > 2.1.35
  const extension = contentType === "text/markdown" ? "md" : _mimeTypes.default.extension(contentType);
  const fileName = (0, _slugify.default)(document.titleWithDefault);
  const attachmentIds = _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document));
  const attachments = attachmentIds.length ? await _models.Attachment.findAll({
    where: {
      teamId: document.teamId,
      id: attachmentIds
    }
  }) : [];
  if (attachments.length === 0) {
    ctx.set("Content-Type", contentType);
    ctx.attachment(`${fileName}.${extension}`);
    ctx.body = content;
    return;
  }
  const zip = new _jszip.default();
  await Promise.all(attachments.map(async attachment => {
    const location = _path.default.join("attachments", `${attachment.id}.${_mimeTypes.default.extension(attachment.contentType)}`);
    zip.file(location, new Promise(resolve => {
      attachment.buffer.then(resolve).catch(err => {
        _Logger.default.warn(`Failed to read attachment from storage`, {
          attachmentId: attachment.id,
          teamId: attachment.teamId,
          error: err.message
        });
        resolve(Buffer.from(""));
      });
    }), {
      date: attachment.updatedAt,
      createFolders: true
    });
    content = content.replace(new RegExp((0, _escapeRegExp.default)(attachment.redirectUrl), "g"), location);
  }));
  zip.file(`${fileName}.${extension}`, content, {
    date: document.updatedAt
  });
  ctx.set("Content-Type", "application/zip");
  ctx.attachment(`${fileName}.zip`);
  ctx.body = zip.generateNodeStream(_ZipHelper.default.defaultStreamOptions);
});
router.post("documents.restore", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _validate.default)(T.DocumentsRestoreSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    collectionId,
    revisionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    paranoid: false,
    rejectOnEmpty: true,
    transaction
  });
  const sourceCollectionId = document.collectionId;
  const destCollectionId = collectionId ?? sourceCollectionId;
  const srcCollection = sourceCollectionId ? await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(sourceCollectionId, {
    paranoid: false
  }) : undefined;
  const destCollection = destCollectionId ? await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(destCollectionId) : undefined;

  // In case of workspace templates, both source and destination collections are undefined.
  if (!document.isWorkspaceTemplate && !destCollection?.isActive) {
    throw (0, _errors.ValidationError)("Unable to restore, the collection may have been deleted or archived");
  }

  // Skip this for workspace templates and drafts of a deleted collection as they won't have sourceCollectionId.
  if (sourceCollectionId && sourceCollectionId !== destCollectionId) {
    (0, _policies.authorize)(user, "updateDocument", srcCollection);
    await srcCollection?.removeDocumentInStructure(document, {
      save: true,
      transaction
    });
  }
  if (document.deletedAt && document.isWorkspaceTemplate) {
    (0, _policies.authorize)(user, "restore", document);
    await document.restore({
      transaction
    });
    await _models.Event.createFromContext(ctx, {
      name: "documents.restore",
      documentId: document.id,
      collectionId: document.collectionId,
      data: {
        title: document.title
      }
    });
  } else if (document.deletedAt) {
    (0, _policies.authorize)(user, "restore", document);
    (0, _policies.authorize)(user, "updateDocument", destCollection);

    // restore a previously deleted document
    await document.restoreTo(destCollectionId, {
      transaction,
      user
    }); // destCollectionId is guaranteed to be defined here
    await _models.Event.createFromContext(ctx, {
      name: "documents.restore",
      documentId: document.id,
      collectionId: document.collectionId,
      data: {
        title: document.title
      }
    });
  } else if (document.archivedAt) {
    (0, _policies.authorize)(user, "unarchive", document);
    (0, _policies.authorize)(user, "updateDocument", destCollection);

    // restore a previously archived document
    await document.restoreTo(destCollectionId, {
      transaction,
      user
    }); // destCollectionId is guaranteed to be defined here
    await _models.Event.createFromContext(ctx, {
      name: "documents.unarchive",
      documentId: document.id,
      collectionId: document.collectionId,
      data: {
        title: document.title,
        sourceCollectionId
      }
    });
  } else if (revisionId) {
    // restore a document to a specific revision
    (0, _policies.authorize)(user, "update", document);
    const revision = await _models.Revision.findByPk(revisionId, {
      transaction
    });
    (0, _policies.authorize)(document, "restore", revision);
    document.restoreFromRevision(revision);
    await document.save({
      transaction
    });
    await _models.Event.createFromContext(ctx, {
      name: "documents.restore",
      documentId: document.id,
      collectionId: document.collectionId,
      data: {
        title: document.title
      }
    });
  } else {
    (0, _validation.assertPresent)(revisionId, "revisionId is required");
  }
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.search_titles", (0, _authentication.default)(), (0, _pagination.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerMinute), (0, _validate.default)(T.DocumentsSearchTitlesSchema), async ctx => {
  const {
    query,
    statusFilter,
    dateFilter,
    collectionId,
    userId
  } = ctx.input.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const {
    user
  } = ctx.state.auth;
  let collaboratorIds = undefined;
  if (collectionId) {
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    (0, _policies.authorize)(user, "readDocument", collection);
  }
  if (userId) {
    collaboratorIds = [userId];
  }
  const documents = await _SearchHelper.default.searchTitlesForUser(user, {
    query,
    dateFilter,
    statusFilter,
    collectionId,
    collaboratorIds,
    offset,
    limit
  });
  const policies = (0, _presenters.presentPolicies)(user, documents);
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document)));
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.search", (0, _authentication.default)({
  optional: true
}), (0, _pagination.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerMinute), (0, _validate.default)(T.DocumentsSearchSchema), async ctx => {
  const {
    query,
    collectionId,
    documentId,
    userId,
    dateFilter,
    statusFilter = [],
    shareId,
    snippetMinWords,
    snippetMaxWords
  } = ctx.input.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const {
    user
  } = ctx.state.auth;
  let teamId;
  let response;
  let share;
  let isPublic = false;
  if (shareId) {
    const teamFromCtx = await (0, _passport.getTeamFromContext)(ctx);
    const {
      document,
      ...loaded
    } = await (0, _documentLoader.default)({
      teamId: teamFromCtx?.id,
      shareId,
      user
    });
    share = loaded.share;
    isPublic = (0, _policies.cannot)(user, "read", document);
    if (!share?.includeChildDocuments) {
      throw (0, _errors.InvalidRequestError)("Child documents cannot be searched");
    }
    teamId = share.teamId;
    const team = await share.$get("team");
    (0, _invariant.default)(team, "Share must belong to a team");
    response = await _SearchHelper.default.searchForTeam(team, {
      query,
      collectionId: document.collectionId,
      share,
      dateFilter,
      statusFilter,
      offset,
      limit,
      snippetMinWords,
      snippetMaxWords
    });
  } else {
    if (!user) {
      throw (0, _errors.AuthenticationError)("Authentication error");
    }
    teamId = user.teamId;
    if (collectionId) {
      const collection = await _models.Collection.scope({
        method: ["withMembership", user.id]
      }).findByPk(collectionId);
      (0, _policies.authorize)(user, "readDocument", collection);
    }
    let documentIds = undefined;
    if (documentId) {
      const document = await _models.Document.findByPk(documentId, {
        userId: user.id
      });
      (0, _policies.authorize)(user, "read", document);
      documentIds = [documentId, ...(await document.findAllChildDocumentIds())];
    }
    let collaboratorIds = undefined;
    if (userId) {
      collaboratorIds = [userId];
    }
    response = await _SearchHelper.default.searchForUser(user, {
      query,
      collaboratorIds,
      collectionId,
      documentIds,
      dateFilter,
      statusFilter,
      offset,
      limit,
      snippetMinWords,
      snippetMaxWords
    });
  }
  const {
    results,
    total
  } = response;
  const documents = results.map(result => result.document);
  const data = await Promise.all(results.map(async result => {
    const document = await (0, _presenters.presentDocument)(ctx, result.document, {
      isPublic,
      shareId
    });
    return {
      ...result,
      document
    };
  }));

  // When requesting subsequent pages of search results we don't want to record
  // duplicate search query records
  if (query && offset === 0) {
    await _models.SearchQuery.create({
      userId: user?.id,
      teamId,
      shareId: share?.id,
      source: ctx.state.auth.type || "app",
      // we'll consider anything that isn't "api" to be "app"
      query,
      results: total
    });
  }
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data,
    policies: user ? (0, _presenters.presentPolicies)(user, documents) : null
  };
});
router.post("documents.templatize", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _validate.default)(T.DocumentsTemplatizeSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    collectionId,
    publish
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const original = await _models.Document.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "update", original);
  if (collectionId) {
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId, {
      transaction
    });
    (0, _policies.authorize)(user, "createDocument", collection);
  } else {
    (0, _policies.authorize)(user, "createTemplate", user.team);
  }
  const document = await _models.Document.create({
    editorVersion: original.editorVersion,
    collectionId,
    teamId: user.teamId,
    publishedAt: publish ? new Date() : null,
    lastModifiedById: user.id,
    createdById: user.id,
    template: true,
    icon: original.icon,
    color: original.color,
    title: original.title,
    text: original.text,
    content: original.content
  }, {
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "documents.create",
    documentId: document.id,
    collectionId: document.collectionId,
    data: {
      title: document.title,
      template: true
    }
  });

  // reload to get all of the data needed to present (user, collection etc)
  const reloaded = await _models.Document.findByPk(document.id, {
    userId: user.id,
    transaction
  });
  (0, _invariant.default)(reloaded, "document not found");
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, reloaded),
    policies: (0, _presenters.presentPolicies)(user, [reloaded])
  };
});
router.post("documents.update", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    insightsEnabled,
    publish,
    collectionId,
    ...input
  } = ctx.input.body;
  const editorVersion = ctx.headers["x-editor-version"];
  const {
    user
  } = ctx.state.auth;
  let collection;
  let document = await _models.Document.findByPk(id, {
    userId: user.id,
    includeState: true,
    transaction
  });
  collection = document?.collection;
  (0, _policies.authorize)(user, "update", document);
  if (collection && insightsEnabled !== undefined) {
    (0, _policies.authorize)(user, "updateInsights", document);
  }
  if (publish) {
    if (document.isDraft) {
      (0, _policies.authorize)(user, "publish", document);
    }
    if (!document.collectionId && !document.isWorkspaceTemplate) {
      (0, _validation.assertPresent)(collectionId, "collectionId is required to publish a draft without collection");
      collection = await _models.Collection.scope({
        method: ["withMembership", user.id]
      }).findByPk(collectionId, {
        transaction
      });
    }
    if (document.parentDocumentId) {
      const parentDocument = await _models.Document.findByPk(document.parentDocumentId, {
        userId: user.id,
        transaction
      });
      (0, _policies.authorize)(user, "createChildDocument", parentDocument, {
        collection
      });
    } else if (document.isWorkspaceTemplate) {
      (0, _policies.authorize)(user, "createTemplate", user.team);
    } else {
      (0, _policies.authorize)(user, "createDocument", collection);
    }
  }
  document = await (0, _documentUpdater.default)(ctx, {
    document,
    user,
    ...input,
    publish,
    collectionId,
    insightsEnabled,
    editorVersion
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.duplicate", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsDuplicateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    title,
    publish,
    recursive,
    collectionId,
    parentDocumentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "read", document);
  const collection = collectionId ? await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(collectionId, {
    transaction
  }) : document?.collection;
  if (collection) {
    (0, _policies.authorize)(user, "updateDocument", collection);
  } else if (document.isWorkspaceTemplate) {
    (0, _policies.authorize)(user, "createTemplate", user.team);
  }
  if (parentDocumentId) {
    const parent = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", parent);
    if (!parent.publishedAt) {
      throw (0, _errors.InvalidRequestError)("Cannot duplicate document inside a draft");
    }
  }
  const response = await (0, _documentDuplicator.default)({
    user,
    collection,
    document,
    title,
    publish,
    recursive,
    parentDocumentId,
    ctx
  });
  ctx.body = {
    data: {
      documents: await Promise.all(response.map(document => (0, _presenters.presentDocument)(ctx, document)))
    },
    policies: (0, _presenters.presentPolicies)(user, response)
  };
});
router.post("documents.move", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsMoveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    parentDocumentId,
    index
  } = ctx.input.body;
  let collectionId = ctx.input.body.collectionId;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "move", document);
  if (collectionId) {
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId, {
      transaction
    });
    (0, _policies.authorize)(user, "updateDocument", collection);
  } else if (document.template) {
    (0, _policies.authorize)(user, "updateTemplate", user.team);
  } else if (!parentDocumentId) {
    throw (0, _errors.InvalidRequestError)("collectionId is required to move a document");
  }
  if (parentDocumentId) {
    const parent = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", parent);
    collectionId = parent.collectionId;
    if (!parent.publishedAt) {
      throw (0, _errors.InvalidRequestError)("Cannot move document inside a draft");
    }
  }
  const {
    documents,
    collectionChanged
  } = await (0, _documentMover.default)({
    user,
    document,
    collectionId: collectionId ?? null,
    parentDocumentId,
    index,
    ip: ctx.request.ip,
    transaction
  });
  ctx.body = {
    data: {
      documents: await Promise.all(documents.map(doc => (0, _presenters.presentDocument)(ctx, doc))),
      // Included for backwards compatibility
      collections: []
    },
    policies: collectionChanged ? (0, _presenters.presentPolicies)(user, documents) : []
  };
});
router.post("documents.archive", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsArchiveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "archive", document);
  await document.archive(user, {
    transaction
  });
  await _models.Event.createFromContext(ctx, {
    name: "documents.archive",
    documentId: document.id,
    collectionId: document.collectionId,
    data: {
      title: document.title
    }
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.delete", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsDeleteSchema), async ctx => {
  const {
    id,
    permanent
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (permanent) {
    const document = await _models.Document.findByPk(id, {
      userId: user.id,
      paranoid: false
    });
    (0, _policies.authorize)(user, "permanentDelete", document);
    await (0, _documentPermanentDeleter.default)([document]);
    await _models.Event.createFromContext(ctx, {
      name: "documents.permanent_delete",
      documentId: document.id,
      collectionId: document.collectionId,
      data: {
        title: document.title
      }
    });
  } else {
    const document = await _models.Document.findByPk(id, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "delete", document);
    await document.delete(user);
    await _models.Event.createFromContext(ctx, {
      name: "documents.delete",
      documentId: document.id,
      collectionId: document.collectionId,
      data: {
        title: document.title
      }
    });
  }
  ctx.body = {
    success: true
  };
});
router.post("documents.unpublish", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsUnpublishSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "unpublish", document);
  const childDocumentIds = await document.findAllChildDocumentIds({
    archivedAt: {
      [_sequelize.Op.eq]: null
    }
  });
  if (childDocumentIds.length > 0) {
    throw (0, _errors.InvalidRequestError)("Cannot unpublish document with child documents");
  }
  await document.unpublish(user);
  await _models.Event.createFromContext(ctx, {
    name: "documents.unpublish",
    documentId: document.id,
    collectionId: document.collectionId,
    data: {
      title: document.title
    }
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.import", (0, _authentication.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _validate.default)(T.DocumentsImportSchema), (0, _multipart.default)({
  maximumFileSize: _env.default.FILE_STORAGE_IMPORT_MAX_SIZE
}), async ctx => {
  const {
    collectionId,
    parentDocumentId,
    publish
  } = ctx.input.body;
  const file = ctx.input.file;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findOne({
    where: {
      id: collectionId,
      teamId: user.teamId
    }
  });
  (0, _policies.authorize)(user, "createDocument", collection);
  let parentDocument;
  if (parentDocumentId) {
    parentDocument = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", parentDocument);
  }
  const buffer = await _fsExtra.default.readFile(file.filepath);
  const fileName = file.originalFilename ?? file.newFilename;
  const mimeType = file.mimetype ?? "";
  const acl = "private";
  const key = _AttachmentHelper.default.getKey({
    acl,
    id: (0, _uuid.v4)(),
    name: fileName,
    userId: user.id
  });
  await _files.default.store({
    body: buffer,
    contentType: mimeType,
    contentLength: buffer.length,
    key,
    acl
  });
  const job = await _DocumentImportTask.default.schedule({
    key,
    sourceMetadata: {
      fileName,
      mimeType
    },
    userId: user.id,
    collectionId,
    parentDocumentId,
    publish
  });
  const response = await job.finished();
  if ("error" in response) {
    throw (0, _errors.InvalidRequestError)(response.error);
  }
  const document = await _models.Document.findByPk(response.documentId, {
    userId: user.id,
    rejectOnEmpty: true
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.create", (0, _authentication.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _validate.default)(T.DocumentsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    title,
    text,
    icon,
    color,
    publish,
    collectionId,
    parentDocumentId,
    fullWidth,
    templateId,
    template,
    createdAt
  } = ctx.input.body;
  const editorVersion = ctx.headers["x-editor-version"];
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  let collection;
  let parentDocument;
  if (parentDocumentId) {
    parentDocument = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id
    });
    if (parentDocument?.collectionId) {
      collection = await _models.Collection.scope({
        method: ["withMembership", user.id]
      }).findOne({
        where: {
          id: parentDocument.collectionId,
          teamId: user.teamId
        },
        transaction
      });
    }
    (0, _policies.authorize)(user, "createChildDocument", parentDocument, {
      collection
    });
  } else if (collectionId) {
    collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findOne({
      where: {
        id: collectionId,
        teamId: user.teamId
      },
      transaction
    });
    (0, _policies.authorize)(user, "createDocument", collection);
  } else if (!!template && !collectionId) {
    (0, _policies.authorize)(user, "createTemplate", user.team);
  }
  let templateDocument;
  if (templateId) {
    templateDocument = await _models.Document.findByPk(templateId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "read", templateDocument);
  }
  const document = await (0, _documentCreator.default)({
    id,
    title,
    text: !(0, _isNil.default)(text) ? await _TextHelper.TextHelper.replaceImagesWithAttachments(ctx, text, user) : text,
    icon,
    color,
    createdAt,
    publish,
    collectionId: collection?.id,
    parentDocumentId,
    templateDocument,
    template,
    fullWidth,
    user,
    editorVersion,
    ctx
  });
  if (collection) {
    document.collection = collection;
  }
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.add_user", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsAddUserSchema), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _transaction.transaction)(), async ctx => {
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
  if (userId === actor.id) {
    throw (0, _errors.ValidationError)("You cannot invite yourself");
  }
  const [document, user] = await Promise.all([_models.Document.findByPk(id, {
    userId: actor.id,
    rejectOnEmpty: true,
    transaction
  }), _models.User.findByPk(userId, {
    rejectOnEmpty: true,
    transaction
  })]);
  (0, _policies.authorize)(actor, "read", user);
  (0, _policies.authorize)(actor, "manageUsers", document);
  const UserMemberships = await _models.UserMembership.findAll({
    where: {
      userId
    },
    attributes: ["id", "index", "updatedAt"],
    limit: 1,
    order: [
    // using LC_COLLATE:"C" because we need byte order to drive the sorting
    // find only the first star so we can create an index before it
    _sequelize.Sequelize.literal('"user_permission"."index" collate "C"'), ["updatedAt", "DESC"]],
    transaction
  });

  // create membership at the beginning of their "Shared with me" section
  const index = (0, _fractionalIndex.default)(null, UserMemberships.length ? UserMemberships[0].index : null);
  const [membership, isNew] = await _models.UserMembership.findOrCreate({
    where: {
      documentId: id,
      userId
    },
    defaults: {
      index,
      permission: permission || user.defaultDocumentPermission,
      createdById: actor.id
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (!isNew && permission) {
    membership.permission = permission;

    // disconnect from the source if the permission is manually updated
    membership.sourceId = null;
    await membership.save(ctx.context);
  }
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      memberships: [(0, _presenters.presentMembership)(membership)]
    }
  };
});
router.post("documents.remove_user", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsRemoveUserSchema), (0, _transaction.transaction)(), async ctx => {
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
  const [document, user] = await Promise.all([_models.Document.findByPk(id, {
    userId: actor.id,
    rejectOnEmpty: true,
    transaction
  }), _models.User.findByPk(userId, {
    rejectOnEmpty: true,
    transaction
  })]);
  if (actor.id !== userId) {
    (0, _policies.authorize)(actor, "manageUsers", document);
    (0, _policies.authorize)(actor, "read", user);
  }
  const membership = await _models.UserMembership.findOne({
    where: {
      documentId: id,
      userId
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("documents.add_group", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsAddGroupSchema), (0, _transaction.transaction)(), async ctx => {
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
  const [document, group] = await Promise.all([_models.Document.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  }), _models.Group.findByPk(groupId, {
    rejectOnEmpty: true,
    transaction
  })]);
  (0, _policies.authorize)(user, "update", document);
  (0, _policies.authorize)(user, "read", group);
  const [membership, created] = await _models.GroupMembership.findOrCreate({
    where: {
      documentId: id,
      groupId
    },
    defaults: {
      permission: permission || user.defaultDocumentPermission,
      createdById: user.id
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (!created && permission) {
    membership.permission = permission;

    // disconnect from the source if the permission is manually updated
    membership.sourceId = null;
    await membership.save(ctx.context);
  }
  ctx.body = {
    data: {
      groupMemberships: [(0, _presenters.presentGroupMembership)(membership)]
    }
  };
});
router.post("documents.remove_group", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsRemoveGroupSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    id,
    groupId
  } = ctx.input.body;
  const [document, group] = await Promise.all([_models.Document.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  }), _models.Group.findByPk(groupId, {
    rejectOnEmpty: true,
    transaction
  })]);
  (0, _policies.authorize)(user, "update", document);
  (0, _policies.authorize)(user, "read", group);
  const membership = await _models.GroupMembership.findOne({
    where: {
      documentId: id,
      groupId
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("documents.memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user: actor
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: actor.id
  });
  (0, _policies.authorize)(actor, "update", document);
  let where = {
    documentId: id
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
router.post("documents.group_memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "update", document);
  let where = {
    documentId: id
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
router.post("documents.empty_trash", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const collectionIds = await user.collectionIds({
    paranoid: false
  });
  const collectionScope = {
    method: ["withCollectionPermissions", user.id]
  };
  const documents = await _models.Document.scope([collectionScope, "withDrafts"]).findAll({
    attributes: ["id"],
    where: {
      deletedAt: {
        [_sequelize.Op.ne]: null
      },
      [_sequelize.Op.or]: [{
        collectionId: {
          [_sequelize.Op.in]: collectionIds
        }
      }, {
        createdById: user.id,
        collectionId: {
          [_sequelize.Op.is]: null
        }
      }]
    },
    paranoid: false
  });
  if (documents.length) {
    await _EmptyTrashTask.default.schedule({
      documentIds: documents.map(doc => doc.id)
    });
  }
  await _models.Event.createFromContext(ctx, {
    name: "documents.empty_trash"
  });
  ctx.body = {
    success: true
  };
});

// Remove this helper once apiVersion is removed (#6175)
function getAPIVersion(ctx) {
  return Number(ctx.headers["x-api-version"] ?? (typeof ctx.input.body === "object" && ctx.input.body && "apiVersion" in ctx.input.body && ctx.input.body.apiVersion) ?? 0);
}
var _default = exports.default = router;