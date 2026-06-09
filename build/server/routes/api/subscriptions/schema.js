"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubscriptionsListSchema = exports.SubscriptionsInfoSchema = exports.SubscriptionsDeleteTokenSchema = exports.SubscriptionsDeleteSchema = exports.SubscriptionsCreateSchema = void 0;
var _zod = require("zod");
var _validation = require("./../../../validation");
var _schema = require("../schema");
const SubscriptionsListSchema = exports.SubscriptionsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: _zod.z.string().refine(_validation.ValidateDocumentId.isValid, {
      message: _validation.ValidateDocumentId.message
    }),
    event: _zod.z.literal("documents.update")
  })
});
const SubscriptionsInfoSchema = exports.SubscriptionsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: _zod.z.string().refine(_validation.ValidateDocumentId.isValid, {
      message: _validation.ValidateDocumentId.message
    }),
    event: _zod.z.literal("documents.update")
  })
});
const SubscriptionsCreateSchema = exports.SubscriptionsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: _zod.z.string().refine(_validation.ValidateDocumentId.isValid, {
      message: _validation.ValidateDocumentId.message
    }),
    event: _zod.z.literal("documents.update")
  })
});
const SubscriptionsDeleteSchema = exports.SubscriptionsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid()
  })
});
const SubscriptionsDeleteTokenSchema = exports.SubscriptionsDeleteTokenSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    userId: _zod.z.string().uuid(),
    documentId: _zod.z.string().uuid(),
    token: _zod.z.string()
  })
});