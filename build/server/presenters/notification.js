"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentNotification;
var _user = _interopRequireDefault(require("./user"));
var _ = require(".");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function presentNotification(ctx, notification) {
  return {
    id: notification.id,
    viewedAt: notification.viewedAt,
    archivedAt: notification.archivedAt,
    createdAt: notification.createdAt,
    event: notification.event,
    userId: notification.userId,
    actorId: notification.actorId,
    actor: notification.actor ? (0, _user.default)(notification.actor) : undefined,
    commentId: notification.commentId,
    comment: notification.comment ? (0, _.presentComment)(notification.comment) : undefined,
    documentId: notification.documentId,
    document: notification.document ? await (0, _.presentDocument)(ctx, notification.document) : undefined,
    revisionId: notification.revisionId,
    collectionId: notification.collectionId
  };
}