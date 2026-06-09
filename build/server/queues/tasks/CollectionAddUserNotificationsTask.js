"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("./../../../shared/types");
var _models = require("./../../models");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class CollectionAddUserNotificationsTask extends _BaseTask.default {
  async perform(event) {
    const recipient = await _models.User.findByPk(event.userId);
    if (!recipient) {
      return;
    }
    if (!recipient.isSuspended && recipient.subscribedToEventType(_types.NotificationEventType.AddUserToCollection)) {
      await _models.Notification.create({
        event: _types.NotificationEventType.AddUserToCollection,
        userId: event.userId,
        actorId: event.actorId,
        teamId: event.teamId,
        collectionId: event.collectionId
      });
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CollectionAddUserNotificationsTask;