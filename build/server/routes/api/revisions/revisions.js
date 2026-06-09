"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _RevisionHelper = require("./../../../../shared/utils/RevisionHelper");
var _slugify = _interopRequireDefault(require("./../../../../shared/utils/slugify"));
var _errors = require("./../../../errors");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _DocumentHelper = require("./../../../models/helpers/DocumentHelper");
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("revisions.info", (0, _authentication.default)(), (0, _validate.default)(T.RevisionsInfoSchema), async ctx => {
  const {
    id,
    documentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  let before, after;
  if (id) {
    const revision = await _models.Revision.findByPk(id, {
      rejectOnEmpty: true
    });
    const document = await _models.Document.findByPk(revision.documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "listRevisions", document);
    after = revision;
    before = await revision.before();
  } else if (documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "listRevisions", document);
    after = _models.Revision.buildFromDocument(document);
    after.id = _RevisionHelper.RevisionHelper.latestId(document.id);
    after.user = document.updatedBy;
    before = await _models.Revision.findLatest(documentId);
  } else {
    throw (0, _errors.ValidationError)("Either id or documentId must be provided");
  }
  ctx.body = {
    data: await (0, _presenters.presentRevision)(after, await _DocumentHelper.DocumentHelper.diff(before, after, {
      includeTitle: false,
      includeStyles: false
    }))
  };
});
router.post("revisions.diff", (0, _authentication.default)(), (0, _validate.default)(T.RevisionsDiffSchema), async ctx => {
  const {
    id,
    compareToId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const revision = await _models.Revision.findByPk(id, {
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(revision.documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "listRevisions", document);
  let before;
  if (compareToId) {
    before = await _models.Revision.findOne({
      where: {
        id: compareToId,
        documentId: revision.documentId,
        createdAt: {
          [_sequelize.Op.lt]: revision.createdAt
        }
      }
    });
    if (!before) {
      throw (0, _errors.ValidationError)("Revision could not be found, compareToId must be a revision of the same document before the provided revision");
    }
  } else {
    before = await revision.before();
  }
  const accept = ctx.request.headers["accept"];
  const content = await _DocumentHelper.DocumentHelper.diff(before, revision);
  if (accept?.includes("text/html")) {
    const name = `${(0, _slugify.default)(document.titleWithDefault)}-${revision.id}.html`;
    ctx.set("Content-Type", "text/html");
    ctx.attachment(name);
    ctx.body = content;
    return;
  }
  ctx.body = {
    data: content
  };
});
router.post("revisions.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.RevisionsListSchema), async ctx => {
  const {
    direction,
    documentId,
    sort
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "listRevisions", document);
  const revisions = await _models.Revision.findAll({
    where: {
      documentId: document.id
    },
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(revisions.map(revision => (0, _presenters.presentRevision)(revision)));
  ctx.body = {
    pagination: ctx.state.pagination,
    data
  };
});
var _default = exports.default = router;