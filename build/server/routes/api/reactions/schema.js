"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactionsListSchema = void 0;
var _zod = require("zod");
var _schema = require("../schema");
const ReactionsListSchema = exports.ReactionsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the comment to list reactions for. */
    commentId: _zod.z.string().uuid()
  })
});