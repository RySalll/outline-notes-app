"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RevisionsListSchema = exports.RevisionsInfoSchema = exports.RevisionsDiffSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = require("zod");
var _models = require("./../../../models");
var _schema = require("./../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const RevisionsInfoSchema = exports.RevisionsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional(),
    documentId: _zod.z.string().uuid().optional()
  }).refine(req => !((0, _isEmpty.default)(req.id) && (0, _isEmpty.default)(req.documentId)), {
    message: "id or documentId is required"
  })
});
const RevisionsDiffSchema = exports.RevisionsDiffSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid(),
    compareToId: _zod.z.string().uuid().optional()
  })
});
const RevisionsListSchema = exports.RevisionsListSchema = _zod.z.object({
  body: _zod.z.object({
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val),
    sort: _zod.z.string().refine(val => Object.keys(_models.Revision.getAttributes()).includes(val), {
      message: "Invalid sort parameter"
    }).default("createdAt"),
    documentId: _zod.z.string().uuid()
  })
});