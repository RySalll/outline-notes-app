"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentShare;
var _ = require(".");
function presentShare(share) {
  let isAdmin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  const data = {
    id: share.id,
    documentId: share.documentId,
    documentTitle: share.document?.title,
    documentUrl: share.document?.url,
    published: share.published,
    url: share.canonicalUrl,
    urlId: share.urlId,
    createdBy: (0, _.presentUser)(share.user),
    includeChildDocuments: share.includeChildDocuments,
    allowIndexing: share.allowIndexing,
    lastAccessedAt: share.lastAccessedAt || undefined,
    views: share.views || 0,
    domain: share.domain,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt
  };
  if (!isAdmin) {
    delete data.lastAccessedAt;
  }
  return data;
}