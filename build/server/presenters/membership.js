"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentMembership;
function presentMembership(membership) {
  return {
    id: membership.id,
    userId: membership.userId,
    documentId: membership.documentId,
    collectionId: membership.collectionId,
    permission: membership.permission,
    createdById: membership.createdById,
    sourceId: membership.sourceId,
    index: membership.index
  };
}