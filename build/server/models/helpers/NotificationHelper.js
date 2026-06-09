"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _sequelize = require("sequelize");
var _types = require("./../../../shared/types");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _ = require("./..");
var _policies = require("./../../policies");
var _ProsemirrorHelper = require("./ProsemirrorHelper");
var _NotificationHelper;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class NotificationHelper {}
exports.default = NotificationHelper;
_NotificationHelper = NotificationHelper;
/**
 * Get the recipients of a notification for a collection event.
 *
 * @param collection The collection to get recipients for
 * @param eventType The event type
 * @returns A list of recipients
 */
_defineProperty(NotificationHelper, "getCollectionNotificationRecipients", async (collection, eventType) => {
  // Find all the users that have notifications enabled for this event
  // type at all and aren't the one that performed the action.
  let recipients = await _.User.findAll({
    where: {
      id: {
        [_sequelize.Op.ne]: collection.createdById
      },
      teamId: collection.teamId
    }
  });
  recipients = recipients.filter(recipient => recipient.subscribedToEventType(eventType));
  return recipients;
});
/**
 * Get the recipients of a notification for a comment event.
 *
 * @param document The document associated with the comment
 * @param comment The comment to get recipients for
 * @param actorId The creator of the comment
 * @returns A list of recipients
 */
_defineProperty(NotificationHelper, "getCommentNotificationRecipients", async (document, comment, actorId) => {
  let recipients = await _NotificationHelper.getDocumentNotificationRecipients(document, _types.NotificationEventType.UpdateDocument, actorId, !comment.parentCommentId);
  recipients = recipients.filter(recipient => recipient.subscribedToEventType(_types.NotificationEventType.CreateComment));
  if (recipients.length > 0 && comment.parentCommentId) {
    const contextComments = await _.Comment.findAll({
      attributes: ["createdById", "data"],
      where: {
        [_sequelize.Op.or]: [{
          id: comment.parentCommentId
        }, {
          parentCommentId: comment.parentCommentId
        }]
      }
    });
    const createdUserIdsInThread = contextComments.map(c => c.createdById);
    const mentionedUserIdsInThread = contextComments.flatMap(c => _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(c.data), {
      type: _types.MentionType.User
    })).map(mention => mention.modelId);
    const userIdsInThread = (0, _uniq.default)([...createdUserIdsInThread, ...mentionedUserIdsInThread]);
    recipients = recipients.filter(r => userIdsInThread.includes(r.id));
  }
  const filtered = [];
  for (const recipient of recipients) {
    // If this recipient has viewed the document since the comment was made
    // then we can avoid sending them a useless notification, yay.
    const view = await _.View.findOne({
      where: {
        userId: recipient.id,
        documentId: document.id,
        updatedAt: {
          [_sequelize.Op.gt]: comment.createdAt
        }
      }
    });
    if (view) {
      _Logger.default.info("processor", `suppressing notification to ${recipient.id} because doc viewed`);
    } else {
      filtered.push(recipient);
    }
  }
  return filtered;
});
/**
 * Get the recipients of a notification for a document event.
 *
 * @param document The document to get recipients for.
 * @param eventType The event name.
 * @param actorId The id of the user that performed the action.
 * @param onlySubscribers Whether to only return recipients that are actively
 * subscribed to the document.
 * @returns A list of recipients
 */
_defineProperty(NotificationHelper, "getDocumentNotificationRecipients", async (document, eventType, actorId, onlySubscribers) => {
  // First find all the users that have notifications enabled for this event
  // type at all and aren't the one that performed the action.
  let recipients = await _.User.findAll({
    where: {
      id: {
        [_sequelize.Op.ne]: actorId
      },
      teamId: document.teamId
    }
  });
  recipients = recipients.filter(recipient => recipient.subscribedToEventType(eventType));

  // Filter further to only those that have a subscription to the document…
  if (onlySubscribers) {
    const subscriptions = await _.Subscription.findAll({
      attributes: ["userId"],
      where: {
        userId: recipients.map(recipient => recipient.id),
        documentId: document.id,
        event: eventType
      }
    });
    const subscribedUserIds = subscriptions.map(subscription => subscription.userId);
    recipients = recipients.filter(recipient => subscribedUserIds.includes(recipient.id));
  }
  const filtered = [];
  for (const recipient of recipients) {
    if (!recipient.email || recipient.isSuspended) {
      continue;
    }

    // Check the recipient has access to the collection this document is in. Just
    // because they are subscribed doesn't mean they still have access to read
    // the document.
    const doc = await _.Document.findByPk(document.id, {
      userId: recipient.id
    });
    if ((0, _policies.can)(recipient, "read", doc)) {
      filtered.push(recipient);
    }
  }
  return filtered;
});