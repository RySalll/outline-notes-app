"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _uuid = require("uuid");
var _types = require("./../../../../shared/types");
var _files = require("./../../../../shared/utils/files");
var _validations = require("./../../../../shared/validations");
var _context = require("./../../../context");
var _errors = require("./../../../errors");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _rateLimiter = require("./../../../middlewares/rateLimiter");
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _AttachmentHelper = _interopRequireDefault(require("./../../../models/helpers/AttachmentHelper"));
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _UploadAttachmentFromUrlTask = _interopRequireDefault(require("./../../../queues/tasks/UploadAttachmentFromUrlTask"));
var _database = require("./../../../storage/database");
var _files2 = _interopRequireDefault(require("./../../../storage/files"));
var _BaseStorage = _interopRequireDefault(require("./../../../storage/files/BaseStorage"));
var _RateLimiter = require("./../../../utils/RateLimiter");
var _validation = require("./../../../validation");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("attachments.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AttachmentsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    documentId,
    contentType,
    size,
    preset
  } = ctx.input.body;
  const {
    auth,
    transaction
  } = ctx.state;
  const {
    user
  } = auth;

  // All user types can upload an avatar so no additional authorization is needed.
  if (preset === _types.AttachmentPreset.Avatar) {
    (0, _validation.assertIn)(contentType, _validations.AttachmentValidation.avatarContentTypes);
  } else if (preset === _types.AttachmentPreset.DocumentAttachment && documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", document);
  } else {
    (0, _policies.authorize)(user, "createAttachment", user.team);
  }
  const maxUploadSize = _AttachmentHelper.default.presetToMaxUploadSize(preset);
  if (size > maxUploadSize) {
    throw (0, _errors.ValidationError)(`Sorry, this file is too large – the maximum size is ${(0, _files.bytesToHumanReadable)(maxUploadSize)}`);
  }
  const modelId = (0, _uuid.v4)();
  const acl = _AttachmentHelper.default.presetToAcl(preset);
  const key = _AttachmentHelper.default.getKey({
    acl,
    id: modelId,
    name,
    userId: user.id
  });
  const attachment = await _models.Attachment.createWithCtx(ctx, {
    id: modelId,
    key,
    acl,
    size,
    expiresAt: _AttachmentHelper.default.presetToExpiry(preset),
    contentType,
    documentId,
    teamId: user.teamId,
    userId: user.id
  });
  const presignedPost = await _files2.default.getPresignedPost(key, acl, maxUploadSize, contentType);
  ctx.body = {
    data: {
      uploadUrl: _files2.default.getUploadUrl(),
      form: {
        "Cache-Control": "max-age=31557600",
        "Content-Type": contentType,
        ...presignedPost.fields
      },
      attachment: {
        ...(0, _presenters.presentAttachment)(attachment),
        // always use the redirect url for document attachments, as the serializer
        // depends on it to detect attachment vs link
        url: preset === _types.AttachmentPreset.DocumentAttachment ? attachment.redirectUrl : attachment.url
      }
    }
  };
});
router.post("attachments.createFromUrl", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AttachmentsCreateFromUrlSchema), async ctx => {
  const {
    url,
    documentId,
    preset
  } = ctx.input.body;
  const {
    user,
    type
  } = ctx.state.auth;
  if (preset !== _types.AttachmentPreset.DocumentAttachment || !documentId) {
    throw (0, _errors.ValidationError)("Only document attachments can be created from a URL");
  }
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "update", document);
  const name = (0, _files.getFileNameFromUrl)(url) ?? "file";
  const modelId = (0, _uuid.v4)();
  const acl = _AttachmentHelper.default.presetToAcl(preset);
  const key = _AttachmentHelper.default.getKey({
    acl,
    id: modelId,
    name,
    userId: user.id
  });

  // Does not use transaction middleware, as attachment must be persisted
  // before the job is scheduled.
  const attachment = await _database.sequelize.transaction(async transaction => _models.Attachment.createWithCtx((0, _context.createContext)({
    authType: type,
    user,
    ip: ctx.ip,
    transaction
  }), {
    id: modelId,
    key,
    acl,
    size: 0,
    expiresAt: _AttachmentHelper.default.presetToExpiry(preset),
    contentType: "application/octet-stream",
    documentId,
    teamId: user.teamId,
    userId: user.id
  }));
  const job = await _UploadAttachmentFromUrlTask.default.schedule({
    attachmentId: attachment.id,
    url
  });
  const response = await job.finished();
  if ("error" in response) {
    throw (0, _errors.InvalidRequestError)(response.error);
  }
  ctx.body = {
    data: (0, _presenters.presentAttachment)(attachment)
  };
});
router.post("attachments.delete", (0, _authentication.default)(), (0, _validate.default)(T.AttachmentDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const attachment = await _models.Attachment.findByPk(id, {
    rejectOnEmpty: true,
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  if (attachment.documentId) {
    const document = await _models.Document.findByPk(attachment.documentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", document);
  }
  (0, _policies.authorize)(user, "delete", attachment);
  await attachment.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
const handleAttachmentsRedirect = async ctx => {
  const id = ctx.input.body.id ?? ctx.input.query.id;
  const {
    user
  } = ctx.state.auth;
  const attachment = await _models.Attachment.findByPk(id, {
    rejectOnEmpty: true
  });
  if (attachment.isPrivate && attachment.teamId !== user.teamId) {
    throw (0, _errors.AuthorizationError)();
  }
  await attachment.update({
    lastAccessedAt: new Date()
  }, {
    silent: true
  });
  if (attachment.isPrivate) {
    ctx.set("Cache-Control", `max-age=${_BaseStorage.default.defaultSignedUrlExpires}, immutable`);
    ctx.redirect(await attachment.signedUrl);
  } else {
    ctx.set("Cache-Control", `max-age=604800, immutable`);
    ctx.redirect(attachment.canonicalUrl);
  }
};
router.get("attachments.redirect", (0, _authentication.default)(), (0, _validate.default)(T.AttachmentsRedirectSchema), handleAttachmentsRedirect);
router.post("attachments.redirect", (0, _authentication.default)(), (0, _validate.default)(T.AttachmentsRedirectSchema), handleAttachmentsRedirect);
var _default = exports.default = router;