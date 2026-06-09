"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SlackPostSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = require("zod");
var _schema = require("./../../../../server/routes/api/schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SlackPostSchema = exports.SlackPostSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    code: _zod.z.string().nullish(),
    state: _zod.z.string(),
    error: _zod.z.string().nullish()
  }).refine(req => !((0, _isEmpty.default)(req.code) && (0, _isEmpty.default)(req.error)), {
    message: "one of code or error is required"
  })
});