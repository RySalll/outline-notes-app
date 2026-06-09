"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _invariant = _interopRequireDefault(require("invariant"));
var _sequelize = require("sequelize");
var _types = require("./../../../shared/types");
var _models = require("./../../models");
var _ProsemirrorHelper = require("./../../models/helpers/ProsemirrorHelper");
var _policies = require("./../../utils/policies");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CommentUpdatedNotificationsTask extends _BaseTask.default {
  async perform(event) {
    const isResolving = event.changes?.previous?.resolvedAt === null && event.changes?.attributes?.resolvedAt !== null;
    return isResolving ? await this.handleResolvedComment(event) : await this.handleMentionedComment(event);
  }
  async handleMentionedComment(event) {
    const newMentionIds = event.data?.newMentionIds;
    if (!newMentionIds) {
      return;
    }
    const [document, comment] = await Promise.all([_models.Document.scope("withCollection").findOne({
      where: {
        id: event.documentId
      }
    }), _models.Comment.findByPk(event.modelId)]);
    if (!document || !comment) {
      return;
    }
    const mentions = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(_ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data), {
      type: _types.MentionType.User
    }).filter(mention => newMentionIds.includes(mention.id));
    const userIdsMentioned = [];
    for (const mention of mentions) {
      if (userIdsMentioned.includes(mention.modelId)) {
        continue;
      }
      const recipient = await _models.User.findByPk(mention.modelId);
      if (mention.actorId && recipient && recipient.id !== mention.actorId && recipient.subscribedToEventType(_types.NotificationEventType.MentionedInComment) && (await (0, _policies.canUserAccessDocument)(recipient, document.id))) {
        await _models.Notification.create({
          event: _types.NotificationEventType.MentionedInComment,
          userId: recipient.id,
          actorId: mention.actorId,
          teamId: document.teamId,
          documentId: document.id,
          commentId: comment.id
        });
        userIdsMentioned.push(mention.modelId);
      }
    }
  }
  async handleResolvedComment(event) {
    (0, _invariant.default)(!event.data?.newMentionIds, "newMentionIds should not be present in resolved comment");
    const [document, commentsAndReplies] = await Promise.all([_models.Document.scope("withCollection").findOne({
      where: {
        id: event.documentId
      }
    }), _models.Comment.findAll({
      where: {
        [_sequelize.Op.or]: [{
          id: event.modelId
        }, {
          parentCommentId: event.modelId
        }]
      }
    })]);
    if (!document || !commentsAndReplies) {
      return;
    }
    const userIdsNotified = [];

    // Don't notify resolver
    userIdsNotified.push(event.actorId);
    for (const item of commentsAndReplies) {
      // Mentions:
      const proseCommentData = _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(item.data);
      const mentions = _ProsemirrorHelper.ProsemirrorHelper.parseMentions(proseCommentData, {
        type: _types.MentionType.User
      });
      const userIds = mentions.map(mention => mention.modelId);

      // Comment author:
      userIds.push(item.createdById);
      for (const userId of userIds) {
        if (userIdsNotified.includes(userId)) {
          continue;
        }
        const user = await _models.User.findByPk(userId);
        if (user && user.subscribedToEventType(_types.NotificationEventType.ResolveComment) && (await (0, _policies.canUserAccessDocument)(user, document.id))) {
          await _models.Notification.create({
            event: _types.NotificationEventType.ResolveComment,
            userId: user.id,
            actorId: event.actorId,
            teamId: document.teamId,
            documentId: document.id,
            commentId: event.modelId
          });
          userIdsNotified.push(userId);
        }
      }
    }
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CommentUpdatedNotificationsTask;