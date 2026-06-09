"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserMembershipsUpdateSchema = exports.UserMembershipsListSchema = void 0;
var _zod = require("zod");
var _schema = require("./../schema");
var _validation = require("./../../../validation");
const UserMembershipsListSchema = exports.UserMembershipsListSchema = _schema.BaseSchema;
const UserMembershipsUpdateSchema = exports.UserMembershipsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid(),
    index: _zod.z.string().regex(_validation.ValidateIndex.regex, {
      message: _validation.ValidateIndex.message
    })
  })
});