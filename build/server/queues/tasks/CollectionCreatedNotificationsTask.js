"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("./../../../shared/types");
var _models = require("./../../models");
var _NotificationHelper = _interopRequireDefault(require("./../../models/helpers/NotificationHelper"));
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CollectionCreatedNotificationsTask extends _BaseTask.default {
  async perform(event) {
    const collection = await _models.Collection.findByPk(event.collectionId);

    // We only send notifications for collections visible to the entire team
    if (!collection || collection.isPrivate) {
      return;
    }
    if ("source" in event.data && event.data.source === "import") {
      return;
    }
    const recipients = await _NotificationHelper.default.getCollectionNotificationRecipients(collection, _types.NotificationEventType.CreateCollection);
    for (const recipient of recipients) {
      // Suppress notifications for suspended users
      if (recipient.isSuspended || !recipient.email) {
        continue;
      }
      await _models.Notification.create({
        event: _types.NotificationEventType.CreateCollection,
        userId: recipient.id,
        collectionId: collection.id,
        actorId: collection.createdById,
        teamId: collection.teamId
      });
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CollectionCreatedNotificationsTask;