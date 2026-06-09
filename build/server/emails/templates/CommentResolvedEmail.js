"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
var _models = require("./../../models");
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
/**
 * Email sent to a user when a comment they are involved in was resolved.
 */
class CommentResolvedEmail extends _BaseEmail.default {
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
    const collection = await document.$get("collection");
    if (!collection) {
      return false;
    }
    const [comment, team] = await Promise.all([_models.Comment.findByPk(commentId), document.$get("team")]);
    if (!comment || !team) {
      return false;
    }
    const body = await this.htmlForData(team, _ProsemirrorHelper.ProsemirrorHelper.toProsemirror(comment.data));
    return {
      document,
      collection,
      body,
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      userId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, _types.NotificationEventType.ResolveComment);
  }
  replyTo(_ref2) {
    let {
      notification
    } = _ref2;
    if (notification?.user && notification.actor?.email) {
      if ((0, _policies.can)(notification.user, "readEmail", notification.actor)) {
        return notification.actor.email;
      }
    }
    return;
  }
  subject(_ref3) {
    let {
      document
    } = _ref3;
    return `Resolved a comment thread in “${document.titleWithDefault}”`;
  }
  preview(_ref4) {
    let {
      actorName
    } = _ref4;
    return `${actorName} resolved a comment thread`;
  }
  fromName(_ref5) {
    let {
      actorName
    } = _ref5;
    return actorName;
  }
  renderAsText(_ref6) {
    let {
      actorName,
      teamUrl,
      document,
      commentId,
      collection
    } = _ref6;
    const t1 = `${actorName} resolved a comment thread on "${document.titleWithDefault}"`;
    const t2 = collection.name ? ` in the ${collection.name} collection` : "";
    const t3 = `Open Thread: ${teamUrl}${document.url}?commentId=${commentId}`;
    return `${t1}${t2}.\n\n${t3}`;
  }
  render(props) {
    const {
      document,
      collection,
      actorName,
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
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, document.titleWithDefault), /*#__PURE__*/React.createElement("p", null, actorName, " resolved a comment on", " ", /*#__PURE__*/React.createElement("a", {
      href: threadLink
    }, document.titleWithDefault), " ", collection.name ? `in the ${collection.name} collection` : "", "."), body && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_EmptySpace.default, {
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
exports.default = CommentResolvedEmail;