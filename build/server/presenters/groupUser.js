"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentGroupUser;
var _ = require(".");
function presentGroupUser(membership, options) {
  return {
    id: `${membership.userId}-${membership.groupId}`,
    userId: membership.userId,
    groupId: membership.groupId,
    user: options?.includeUser ? (0, _.presentUser)(membership.user) : undefined
  };
}