"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CronSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = require("zod");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const CronSchema = exports.CronSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    token: _zod.z.string().optional(),
    limit: _zod.z.coerce.number().gt(0).default(500)
  }),
  query: _zod.z.object({
    token: _zod.z.string().optional(),
    limit: _zod.z.coerce.number().gt(0).default(500)
  })
}).refine(req => !((0, _isEmpty.default)(req.body.token) && (0, _isEmpty.default)(req.query.token)), {
  message: "token is required"
});