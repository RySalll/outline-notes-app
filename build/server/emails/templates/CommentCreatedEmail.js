"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
var _models = require("./../../models");
var _DocumentHelper = require("./../../models/helpers/DocumentHelper");
var _NotificationSettingsHelper = _interopRequireDefault(require("./../../models/helpers/NotificationSettingsHelper"));
var _ProsemirrorHelper = require("./../../models/helpers/ProsemirrorHelper");
var _policies = require("./../../policies");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _Diff = _interopRequireDefault(require("./components/Diff"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const MAX_SUBJECT_CONTENT = 50;
/**
 * Email sent to a user when a new comment is created in a document they are
 * subscribed to.
 */
class CommentCreatedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(props) {
    const {
      documentId,
      commentId
    } = props;
    const document = await _models.Document.unscoped().findByPk(documentId);
    if (!document) {
      return false;
    }
    const [comment, team, collection] = await Promise.all([_models.Comment.findByPk(commentId), document.$get("team"), document.$get("collection")]);
    if (!comment || !team) {
      return false;
    }
    const parentComment = comment.parentCommentId ? (await comment.$get("parentComment")) ?? undefined : undefined;
    const body = await this.htmlForData(team, _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data));
    const isReply = !!comment.parentCommentId;
    return {
      comment,
      parentComment,
      document,
      collection,
      isReply,
      body,
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      userId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, _types.NotificationEventType.CreateComment);
  }
  subject(_ref2) {
    let {
      comment,
      parentComment,
      document
    } = _ref2;
    const commentText = _DocumentHelper.DocumentHelper.toPlainText(parentComment?.data ?? comment.data);
    const trimmedText = commentText.length <= MAX_SUBJECT_CONTENT ? commentText : `${commentText.slice(0, MAX_SUBJECT_CONTENT)}...`;
    return `${parentComment ? "Re: " : ""}New comment on “${document.titleWithDefault}” - ${trimmedText}`;
  }
  preview(_ref3) {
    let {
      isReply,
      actorName
    } = _ref3;
    return isReply ? `${actorName} replied in a thread` : `${actorName} commented on the document`;
  }
  fromName(_ref4) {
    let {
      actorName
    } = _ref4;
    return actorName;
  }
  replyTo(_ref5) {
    let {
      notification
    } = _ref5;
    if (notification?.user && notification.actor?.email) {
      if ((0, _policies.can)(notification.user, "readEmail", notification.actor)) {
        return notification.actor.email;
      }
    }
    return;
  }
  renderAsText(_ref6) {
    let {
      actorName,
      teamUrl,
      isReply,
      document,
      commentId,
      collection
    } = _ref6;
    return `
${actorName} ${isReply ? "replied to a thread in" : "commented on"} "${document.titleWithDefault}"${collection?.name ? `in the ${collection.name} collection` : ""}.

Open Thread: ${teamUrl}${document.url}?commentId=${commentId}
`;
  }
  render(props) {
    const {
      document,
      actorName,
      isReply,
      collection,
      teamUrl,
      commentId,
      unsubscribeUrl,
      body
    } = props;
    const threadLink = `${teamUrl}${document.url}?commentId=${commentId}&ref=notification-email`;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: threadLink,
        name: "View Thread"
      }
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, document.titleWithDefault), /*#__PURE__*/React.createElement("p", null, actorName, " ", isReply ? "replied to a thread in" : "commented on", " ", /*#__PURE__*/React.createElement("a", {
      href: threadLink
    }, document.titleWithDefault), " ", collection?.name ? `in the ${collection.name} collection` : "", "."), body && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 20
    }), /*#__PURE__*/React.createElement(_Diff.default, null, /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: body
      }
    })), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 20
    })), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: threadLink
    }, "Open Thread"))), /*#__PURE__*/React.createElement(_Footer.default, {
      unsubscribeUrl: unsubscribeUrl
    }));
  }
}
exports.default = CommentCreatedEmail;