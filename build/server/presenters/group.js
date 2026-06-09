"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentGroup;
async function presentGroup(group) {
  return {
    id: group.id,
    name: group.name,
    externalId: group.externalId,
    memberCount: await group.memberCount,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  };
}