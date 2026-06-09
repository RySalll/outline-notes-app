"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmailSchema = exports.EmailCallbackSchema = void 0;
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _schema = require("./../../../../server/routes/api/schema");
const EmailSchema = exports.EmailSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    email: _zod.z.string().email(),
    client: _zod.z.nativeEnum(_types.Client).default(_types.Client.Web)
  })
});
const EmailCallbackSchema = exports.EmailCallbackSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    token: _zod.z.string(),
    client: _zod.z.nativeEnum(_types.Client).default(_types.Client.Web),
    follow: _zod.z.string().default("")
  })
});