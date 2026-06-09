"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileOperationsRedirectSchema = exports.FileOperationsListSchema = exports.FileOperationsInfoSchema = exports.FileOperationsDeleteSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = _interopRequireDefault(require("zod"));
var _types = require("./../../../../shared/types");
var _models = require("./../../../models");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const CollectionsSortParamsSchema = _zod.default.object({
  /** The attribute to sort by */
  sort: _zod.default.string().refine(val => Object.keys(_models.FileOperation.getAttributes()).includes(val), {
    message: "Invalid sort parameter"
  }).default("createdAt"),
  /** The direction of the sorting */
  direction: _zod.default.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
});
const FileOperationsInfoSchema = exports.FileOperationsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.default.object({
    /** Id of the file operation to be retrieved */
    id: _zod.default.string().uuid()
  })
});
const FileOperationsListSchema = exports.FileOperationsListSchema = _schema.BaseSchema.extend({
  body: CollectionsSortParamsSchema.extend({
    /** File Operation Type */
    type: _zod.default.nativeEnum(_types.FileOperationType)
  })
});
const FileOperationsRedirectSchema = exports.FileOperationsRedirectSchema = _schema.BaseSchema.extend({
  body: _zod.default.object({
    /** Id of the file operation to access */
    id: _zod.default.string().uuid().optional()
  }),
  query: _zod.default.object({
    /** Id of the file operation to access */
    id: _zod.default.string().uuid().optional()
  })
}).refine(req => !((0, _isEmpty.default)(req.body.id) && (0, _isEmpty.default)(req.query.id)), {
  message: "id is required"
});
const FileOperationsDeleteSchema = exports.FileOperationsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.default.object({
    /** Id of the file operation to delete */
    id: _zod.default.string().uuid()
  })
});