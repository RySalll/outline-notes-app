"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentGroupMembership;
function presentGroupMembership(membership) {
  return {
    id: membership.id,
    groupId: membership.groupId,
    documentId: membership.documentId,
    collectionId: membership.collectionId,
    permission: membership.permission,
    sourceId: membership.sourceId
  };
}