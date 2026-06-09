"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectionsUpdateSchema = exports.CollectionsRestoreSchema = exports.CollectionsRemoveUserSchema = exports.CollectionsRemoveGroupSchema = exports.CollectionsMoveSchema = exports.CollectionsMembershipsSchema = exports.CollectionsListSchema = exports.CollectionsInfoSchema = exports.CollectionsImportSchema = exports.CollectionsExportSchema = exports.CollectionsExportAllSchema = exports.CollectionsDocumentsSchema = exports.CollectionsDeleteSchema = exports.CollectionsCreateSchema = exports.CollectionsArchivedSchema = exports.CollectionsArchiveSchema = exports.CollectionsAddUserSchema = exports.CollectionsAddGroupSchema = void 0;
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _models = require("./../../../models");
var _zod2 = require("./../../../utils/zod");
var _validation = require("./../../../validation");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const BaseIdSchema = _zod.z.object({
  /** Id of the collection to be updated */
  id: (0, _zod2.zodIdType)()
});
const CollectionsCreateSchema = exports.CollectionsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    name: _zod.z.string(),
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish(),
    description: _zod.z.string().nullish(),
    data: (0, _schema.ProsemirrorSchema)({
      allowEmpty: true
    }).nullish(),
    permission: _zod.z.nativeEnum(_types.CollectionPermission).nullish().transform(val => (0, _isUndefined.default)(val) ? null : val),
    sharing: _zod.z.boolean().default(true),
    icon: (0, _zod2.zodIconType)().optional(),
    sort: _zod.z.object({
      field: _zod.z.union([_zod.z.literal("title"), _zod.z.literal("index")]),
      direction: _zod.z.union([_zod.z.literal("asc"), _zod.z.literal("desc")])
    }).default(_models.Collection.DEFAULT_SORT),
    index: _zod.z.string().regex(_validation.ValidateIndex.regex, {
      message: _validation.ValidateIndex.message
    }).max(_validation.ValidateIndex.maxLength, {
      message: `Must be ${_validation.ValidateIndex.maxLength} or fewer characters long`
    }).optional()
  })
});
const CollectionsInfoSchema = exports.CollectionsInfoSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsDocumentsSchema = exports.CollectionsDocumentsSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsImportSchema = exports.CollectionsImportSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    permission: _zod.z.nativeEnum(_types.CollectionPermission).nullish().transform(val => (0, _isUndefined.default)(val) ? null : val),
    attachmentId: _zod.z.string().uuid(),
    format: _zod.z.nativeEnum(_types.FileOperationFormat).default(_types.FileOperationFormat.MarkdownZip)
  })
});
const CollectionsAddGroupSchema = exports.CollectionsAddGroupSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    groupId: _zod.z.string().uuid(),
    permission: _zod.z.nativeEnum(_types.CollectionPermission).default(_types.CollectionPermission.ReadWrite)
  })
});
const CollectionsRemoveGroupSchema = exports.CollectionsRemoveGroupSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    groupId: _zod.z.string().uuid()
  })
});
const CollectionsAddUserSchema = exports.CollectionsAddUserSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    userId: _zod.z.string().uuid(),
    permission: _zod.z.nativeEnum(_types.CollectionPermission).optional()
  })
});
const CollectionsRemoveUserSchema = exports.CollectionsRemoveUserSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    userId: _zod.z.string().uuid()
  })
});
const CollectionsMembershipsSchema = exports.CollectionsMembershipsSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    query: _zod.z.string().optional(),
    permission: _zod.z.nativeEnum(_types.CollectionPermission).optional()
  })
});
const CollectionsExportSchema = exports.CollectionsExportSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    format: _zod.z.nativeEnum(_types.FileOperationFormat).default(_types.FileOperationFormat.MarkdownZip),
    includeAttachments: _zod.z.boolean().default(true)
  })
});
const CollectionsExportAllSchema = exports.CollectionsExportAllSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    format: _zod.z.nativeEnum(_types.FileOperationFormat).default(_types.FileOperationFormat.MarkdownZip),
    includeAttachments: _zod.z.boolean().default(true)
  })
});
const CollectionsUpdateSchema = exports.CollectionsUpdateSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    name: _zod.z.string().optional(),
    description: _zod.z.string().nullish(),
    data: (0, _schema.ProsemirrorSchema)({
      allowEmpty: true
    }).nullish(),
    icon: (0, _zod2.zodIconType)().nullish(),
    permission: _zod.z.nativeEnum(_types.CollectionPermission).nullish(),
    color: _zod.z.string().regex(_validation.ValidateColor.regex, {
      message: _validation.ValidateColor.message
    }).nullish(),
    sort: _zod.z.object({
      field: _zod.z.union([_zod.z.literal("title"), _zod.z.literal("index")]),
      direction: _zod.z.union([_zod.z.literal("asc"), _zod.z.literal("desc")])
    }).optional(),
    sharing: _zod.z.boolean().optional()
  })
});
const CollectionsListSchema = exports.CollectionsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    includeListOnly: _zod.z.boolean().default(false),
    /** Collection statuses to include in results */
    statusFilter: _zod.z.nativeEnum(_types.CollectionStatusFilter).array().optional()
  })
});
const CollectionsDeleteSchema = exports.CollectionsDeleteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsArchiveSchema = exports.CollectionsArchiveSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsRestoreSchema = exports.CollectionsRestoreSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const CollectionsArchivedSchema = exports.CollectionsArchivedSchema = _schema.BaseSchema;
const CollectionsMoveSchema = exports.CollectionsMoveSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    index: _zod.z.string().regex(_validation.ValidateIndex.regex, {
      message: _validation.ValidateIndex.message
    }).max(_validation.ValidateIndex.maxLength, {
      message: `Must be ${_validation.ValidateIndex.maxLength} or fewer characters long`
    })
  })
});