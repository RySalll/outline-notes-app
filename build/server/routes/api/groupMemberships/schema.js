"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GroupMembershipsListSchema = void 0;
var _zod = require("zod");
var _schema = require("./../schema");
const GroupMembershipsListSchema = exports.GroupMembershipsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    groupId: _zod.z.string().uuid().optional()
  })
});