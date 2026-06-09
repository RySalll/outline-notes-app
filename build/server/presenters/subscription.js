"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentSubscription;
function presentSubscription(subscription) {
  return {
    id: subscription.id,
    userId: subscription.userId,
    documentId: subscription.documentId,
    event: subscription.event,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt
  };
}