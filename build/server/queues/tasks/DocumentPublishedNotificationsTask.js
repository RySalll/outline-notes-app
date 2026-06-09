"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("./../../../shared/types");
var _subscriptionCreator = require("./../../commands/subscriptionCreator");
var _models = require("./../../models");
var _DocumentHelper = require("./../../models/helpers/DocumentHelper");
var _NotificationHelper = _interopRequireDefault(require("./../../models/helpers/NotificationHelper"));
var _policies = require("./../../utils/policies");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentPublishedNotificationsTask extends _BaseTask.default {
  async perform(event) {
    const document = await _models.Document.findByPk(event.documentId, {
      includeState: true
    });
    if (!document) {
      return;
    }
    await (0, _subscriptionCreator.createSubscriptionsForDocument)(document, event);

    // Send notifications to mentioned users first
    const mentions = _DocumentHelper.DocumentHelper.parseMentions(document, {
      type: _types.MentionType.User
    });
    const userIdsMentioned = [];
    for (const mention of mentions) {
      if (userIdsMentioned.includes(mention.modelId)) {
        continue;
      }
      const recipient = await _models.User.findByPk(mention.modelId);
      if (recipient && recipient.id !== mention.actorId && recipient.subscribedToEventType(_types.NotificationEventType.MentionedInDocument) && (await (0, _policies.canUserAccessDocument)(recipient, document.id))) {
        await _models.Notification.create({
          event: _types.NotificationEventType.MentionedInDocument,
          userId: recipient.id,
          actorId: mention.actorId,
          teamId: document.teamId,
          documentId: document.id
        });
        userIdsMentioned.push(recipient.id);
      }
    }
    const recipients = (await _NotificationHelper.default.getDocumentNotificationRecipients(document, _types.NotificationEventType.PublishDocument, document.lastModifiedById, false)).filter(recipient => !userIdsMentioned.includes(recipient.id));
    for (const recipient of recipients) {
      await _models.Notification.create({
        event: _types.NotificationEventType.PublishDocument,
        userId: recipient.id,
        actorId: document.updatedBy.id,
        teamId: document.teamId,
        documentId: document.id
      });
    }
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = DocumentPublishedNotificationsTask;