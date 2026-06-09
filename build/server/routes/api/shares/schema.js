"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharesUpdateSchema = exports.SharesRevokeSchema = exports.SharesListSchema = exports.SharesInfoSchema = exports.SharesCreateSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _zod = require("zod");
var _UrlHelper = require("./../../../../shared/utils/UrlHelper");
var _models = require("./../../../models");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SharesInfoSchema = exports.SharesInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional(),
    documentId: _zod.z.string().optional().refine(val => val ? (0, _isUUID.default)(val) || _UrlHelper.UrlHelper.SLUG_URL_REGEX.test(val) : true, {
      message: "must be uuid or url slug"
    })
  }).refine(body => !((0, _isEmpty.default)(body.id) && (0, _isEmpty.default)(body.documentId)), {
    message: "id or documentId is required"
  })
});
const SharesListSchema = exports.SharesListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    sort: _zod.z.string().refine(val => Object.keys(_models.Share.getAttributes()).includes(val), {
      message: `must be one of ${Object.keys(_models.Share.getAttributes()).join(", ")}`
    }).default("updatedAt"),
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
  })
});
const SharesUpdateSchema = exports.SharesUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid(),
    includeChildDocuments: _zod.z.boolean().optional(),
    published: _zod.z.boolean().optional(),
    allowIndexing: _zod.z.boolean().optional(),
    urlId: _zod.z.string().regex(_UrlHelper.UrlHelper.SHARE_URL_SLUG_REGEX, {
      message: "must contain only alphanumeric and dashes"
    }).nullish()
  })
});
const SharesCreateSchema = exports.SharesCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: _zod.z.string().refine(val => (0, _isUUID.default)(val) || _UrlHelper.UrlHelper.SLUG_URL_REGEX.test(val), {
      message: "must be uuid or url slug"
    }),
    published: _zod.z.boolean().default(false),
    urlId: _zod.z.string().regex(_UrlHelper.UrlHelper.SHARE_URL_SLUG_REGEX, {
      message: "must contain only alphanumeric and dashes"
    }).optional(),
    includeChildDocuments: _zod.z.boolean().default(false)
  })
});
const SharesRevokeSchema = exports.SharesRevokeSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid()
  })
});