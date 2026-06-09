"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateTestUsersSchema = void 0;
var _zod = require("zod");
var _schema = require("../schema");
const CreateTestUsersSchema = exports.CreateTestUsersSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    count: _zod.z.coerce.number().default(10)
  })
});