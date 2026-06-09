"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchesUpdateSchema = exports.SearchesListSchema = exports.SearchesDeleteSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = require("zod");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SearchesDeleteSchema = exports.SearchesDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional(),
    query: _zod.z.string().optional()
  })
}).refine(req => !((0, _isEmpty.default)(req.body.id) && (0, _isEmpty.default)(req.body.query)), {
  message: "id or query is required"
});
const SearchesUpdateSchema = exports.SearchesUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid(),
    score: _zod.z.number().min(-1).max(1)
  })
});
const SearchesListSchema = exports.SearchesListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    source: _zod.z.string().optional()
  }).optional()
});