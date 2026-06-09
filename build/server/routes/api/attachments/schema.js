"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachmentsRedirectSchema = exports.AttachmentsCreateSchema = exports.AttachmentsCreateFromUrlSchema = exports.AttachmentDeleteSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _schema = require("./../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const AttachmentsCreateSchema = exports.AttachmentsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Attachment name */
    name: _zod.z.string(),
    /** Id of the document to which the Attachment belongs */
    documentId: _zod.z.string().uuid().optional(),
    /** File size of the Attachment */
    size: _zod.z.number(),
    /** Content-Type of the Attachment */
    contentType: _zod.z.string().optional().default("application/octet-stream"),
    /** Attachment type */
    preset: _zod.z.nativeEnum(_types.AttachmentPreset).default(_types.AttachmentPreset.DocumentAttachment)
  })
});
const AttachmentsCreateFromUrlSchema = exports.AttachmentsCreateFromUrlSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Attachment url */
    url: _zod.z.string(),
    /** Id of the document to which the Attachment belongs */
    documentId: _zod.z.string().uuid().optional(),
    /** Attachment type */
    preset: _zod.z.nativeEnum(_types.AttachmentPreset).default(_types.AttachmentPreset.DocumentAttachment)
  })
});
const AttachmentDeleteSchema = exports.AttachmentDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the attachment to be deleted */
    id: _zod.z.string().uuid()
  })
});
const AttachmentsRedirectSchema = exports.AttachmentsRedirectSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the attachment to be deleted */
    id: _zod.z.string().uuid().optional()
  }),
  query: _zod.z.object({
    /** Id of the attachment to be deleted */
    id: _zod.z.string().uuid().optional()
  })
}).refine(req => !((0, _isEmpty.default)(req.body.id) && (0, _isEmpty.default)(req.query.id)), {
  message: "id is required"
});