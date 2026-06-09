"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PinsUpdateSchema = exports.PinsListSchema = exports.PinsDeleteSchema = exports.PinsCreateSchema = void 0;
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _zod = require("zod");
var _UrlHelper = require("./../../../../shared/utils/UrlHelper");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const PinsCreateSchema = exports.PinsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: _zod.z.string({
      required_error: "required"
    }).refine(val => (0, _isUUID.default)(val) || _UrlHelper.UrlHelper.SLUG_URL_REGEX.test(val), {
      message: "must be uuid or url slug"
    }),
    collectionId: _zod.z.string().uuid().nullish(),
    index: _zod.z.string().regex(new RegExp("^[\x20-\x7E]+$"), {
      message: "must be between x20 to x7E ASCII"
    }).optional()
  })
});
const PinsListSchema = exports.PinsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    collectionId: _zod.z.string().uuid().nullish()
  })
});
const PinsUpdateSchema = exports.PinsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid(),
    index: _zod.z.string().regex(new RegExp("^[\x20-\x7E]+$"), {
      message: "must be between x20 to x7E ASCII"
    })
  })
});
const PinsDeleteSchema = exports.PinsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid()
  })
});