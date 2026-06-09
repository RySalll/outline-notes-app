"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SuggestionsListSchema = void 0;
var _zod = require("zod");
var _schema = require("../schema");
const SuggestionsListSchema = exports.SuggestionsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    query: _zod.z.string().optional()
  })
});