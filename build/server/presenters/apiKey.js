"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentApiKey;
function presentApiKey(apiKey) {
  return {
    id: apiKey.id,
    userId: apiKey.userId,
    name: apiKey.name,
    scope: apiKey.scope,
    value: apiKey.value,
    last4: apiKey.last4,
    createdAt: apiKey.createdAt,
    updatedAt: apiKey.updatedAt,
    expiresAt: apiKey.expiresAt,
    lastActiveAt: apiKey.lastActiveAt
  };
}