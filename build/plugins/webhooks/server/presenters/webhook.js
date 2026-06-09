"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentWebhook;
function presentWebhook(_ref) {
  let {
    event,
    delivery,
    payload
  } = _ref;
  return {
    id: delivery.id,
    actorId: event.actorId,
    webhookSubscriptionId: delivery.webhookSubscriptionId,
    createdAt: delivery.createdAt,
    event: event.name,
    payload
  };
}