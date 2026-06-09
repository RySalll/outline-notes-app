"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UrlsUnfurlSchema = exports.UrlsCheckCnameSchema = void 0;
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _zod = require("zod");
var _UrlHelper = require("./../../../../shared/utils/UrlHelper");
var _urls = require("./../../../../shared/utils/urls");
var _validation = require("./../../../validation");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const UrlsUnfurlSchema = exports.UrlsUnfurlSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    url: _zod.z.string().url().refine(val => {
      try {
        const url = new URL(val);
        if (url.protocol === "mention:") {
          return _validation.ValidateURL.isValidMentionUrl(val);
        }
        return (0, _urls.isUrl)(val);
      } catch (err) {
        return false;
      }
    }, {
      message: _validation.ValidateURL.message
    }),
    documentId: _zod.z.string().optional().refine(val => val ? (0, _isUUID.default)(val) || _UrlHelper.UrlHelper.SLUG_URL_REGEX.test(val) : true, {
      message: "must be uuid or url slug"
    })
  }).refine(val => !(_validation.ValidateURL.isValidMentionUrl(val.url) && (0, _isNil.default)(val.documentId)), {
    message: "documentId required"
  })
});
const UrlsCheckCnameSchema = exports.UrlsCheckCnameSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    hostname: _zod.z.string()
  })
});