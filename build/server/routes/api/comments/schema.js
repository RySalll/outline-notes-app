"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommentsUpdateSchema = exports.CommentsUnresolveSchema = exports.CommentsResolveSchema = exports.CommentsReactionSchema = exports.CommentsListSchema = exports.CommentsInfoSchema = exports.CommentsDeleteSchema = exports.CommentsCreateSchema = void 0;
var _emojiRegex = _interopRequireDefault(require("emoji-regex"));
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _schema = require("./../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const BaseIdSchema = _zod.z.object({
  /** Comment Id */
  id: _zod.z.string().uuid()
});
const CommentsSortParamsSchema = _zod.z.object({
  /** Specifies the attributes by which comments will be sorted in the list */
  sort: _zod.z.string().refine(val => ["createdAt", "updatedAt"].includes(val)).default("createdAt"),
  /** Specifies the sort order with respect to sort field */
  direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
});
const CommentsCreateSchema = exports.CommentsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Allow creation with a specific ID */
    id: _zod.z.string().uuid().optional(),
    /** Create comment for this document */
    documentId: _zod.z.string().uuid(),
    /** Create comment under this parent */
    parentCommentId: _zod.z.string().uuid().optional(),
    /** Create comment with this data */
    data: (0, _schema.ProsemirrorSchema)()
  })
});
const CommentsUpdateSchema = exports.CommentsUpdateSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    /** Update comment with this data */
    data: (0, _schema.ProsemirrorSchema)()
  })
});
const CommentsDeleteSchema = exports.CommentsDeleteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CommentsListSchema = exports.CommentsListSchema = _schema.BaseSchema.extend({
  body: CommentsSortParamsSchema.extend({
    /** Id of a document to list comments for */
    documentId: _zod.z.string().optional(),
    /** Id of a collection to list comments for */
    collectionId: _zod.z.string().optional(),
    /** Id of a parent comment to list comments for */
    parentCommentId: _zod.z.string().uuid().optional(),
    /** Comment statuses to include in results */
    statusFilter: _zod.z.nativeEnum(_types.CommentStatusFilter).array().optional(),
    /** Whether to include anchor text, if it exists */
    includeAnchorText: _zod.z.boolean().optional()
  })
});
const CommentsInfoSchema = exports.CommentsInfoSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /** Whether to include anchor text, if it exists */
    includeAnchorText: _zod.z.boolean().optional()
  })
});
const CommentsResolveSchema = exports.CommentsResolveSchema = _zod.z.object({
  body: BaseIdSchema
});
const CommentsUnresolveSchema = exports.CommentsUnresolveSchema = _zod.z.object({
  body: BaseIdSchema
});
const CommentsReactionSchema = exports.CommentsReactionSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /**  Emoji that's added to (or) removed from a comment as a reaction. */
    emoji: _zod.z.string().regex((0, _emojiRegex.default)())
  })
});