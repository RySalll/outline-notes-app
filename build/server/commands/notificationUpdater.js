"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = notificationUpdater;
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _models = require("./../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This command updates notification properties.
 *
 * @param ctx The originating request context
 * @param Props The properties of the notification to update
 * @returns Notification The updated notification
 */
async function notificationUpdater(ctx, _ref) {
  let {
    notification,
    viewedAt,
    archivedAt
  } = _ref;
  const {
    transaction
  } = ctx.state;
  if (!(0, _isUndefined.default)(viewedAt)) {
    notification.viewedAt = viewedAt;
  }
  if (!(0, _isUndefined.default)(archivedAt)) {
    notification.archivedAt = archivedAt;
  }
  const changed = notification.changed();
  if (changed) {
    await notification.save({
      transaction
    });
    await _models.Event.createFromContext(ctx, {
      name: "notifications.update",
      userId: notification.userId,
      modelId: notification.id,
      documentId: notification.documentId
    }, {
      actorId: notification.userId,
      teamId: notification.teamId
    });
  }
  return notification;
}