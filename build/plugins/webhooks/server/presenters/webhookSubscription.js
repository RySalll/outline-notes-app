"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentWebhookSubscription;
function presentWebhookSubscription(webhook) {
  return {
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    secret: webhook.secret,
    events: webhook.events,
    enabled: webhook.enabled,
    createdAt: webhook.createdAt,
    updatedAt: webhook.updatedAt
  };
}