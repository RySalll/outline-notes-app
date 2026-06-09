"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAttachmentIds;
var _compact = _interopRequireDefault(require("lodash/compact"));
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _ProsemirrorHelper = require("./../../shared/utils/ProsemirrorHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function parseAttachmentIds(text) {
  let includePublic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return (0, _uniq.default)((0, _compact.default)([...text.matchAll(_ProsemirrorHelper.attachmentRedirectRegex), ...(includePublic ? text.matchAll(_ProsemirrorHelper.attachmentPublicRegex) : [])].map(match => match.groups && match.groups.id)));
}