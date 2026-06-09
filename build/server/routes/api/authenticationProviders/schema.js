"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationProvidersUpdateSchema = exports.AuthenticationProvidersInfoSchema = void 0;
var _zod = require("zod");
var _schema = require("./../schema");
const AuthenticationProvidersInfoSchema = exports.AuthenticationProvidersInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Authentication Provider Id */
    id: _zod.z.string().uuid()
  })
});
const AuthenticationProvidersUpdateSchema = exports.AuthenticationProvidersUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Authentication Provider Id */
    id: _zod.z.string().uuid(),
    /** Whether the Authentication Provider is enabled or not */
    isEnabled: _zod.z.boolean()
  })
});