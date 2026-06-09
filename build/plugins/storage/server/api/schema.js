"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilesGetSchema = exports.FilesCreateSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = require("zod");
var _validation = require("./../../../../server/validation");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const FilesCreateSchema = exports.FilesCreateSchema = _zod.z.object({
  body: _zod.z.object({
    key: _zod.z.string().refine(_validation.ValidateKey.isValid, {
      message: _validation.ValidateKey.message
    }).transform(_validation.ValidateKey.sanitize)
  }),
  file: _zod.z.custom()
});
const FilesGetSchema = exports.FilesGetSchema = _zod.z.object({
  query: _zod.z.object({
    key: _zod.z.string().refine(_validation.ValidateKey.isValid, {
      message: _validation.ValidateKey.message
    }).optional().transform(val => val ? _validation.ValidateKey.sanitize(val) : undefined),
    sig: _zod.z.string().optional(),
    download: _zod.z.string().optional()
  }).refine(obj => !((0, _isEmpty.default)(obj.key) && (0, _isEmpty.default)(obj.sig)), {
    message: "One of key or sig is required"
  })
});