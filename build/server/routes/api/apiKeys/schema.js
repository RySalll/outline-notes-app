"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.APIKeysListSchema = exports.APIKeysDeleteSchema = exports.APIKeysCreateSchema = void 0;
var _zod = require("zod");
var _schema = require("./../schema");
const APIKeysCreateSchema = exports.APIKeysCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** API Key name */
    name: _zod.z.string(),
    /** API Key expiry date */
    expiresAt: _zod.z.coerce.date().optional(),
    /** A list of scopes that this API key has access to */
    scope: _zod.z.array(_zod.z.string()).optional()
  })
});
const APIKeysListSchema = exports.APIKeysListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** The owner of the API key */
    userId: _zod.z.string().uuid().optional()
  })
});
const APIKeysDeleteSchema = exports.APIKeysDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** API Key Id */
    id: _zod.z.string().uuid()
  })
});