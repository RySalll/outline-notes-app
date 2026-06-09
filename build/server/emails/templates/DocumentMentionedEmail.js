"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _differenceBy = _interopRequireDefault(require("lodash/differenceBy"));
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
var _models = require("./../../models");
var _DocumentHelper = require("./../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("./../../models/helpers/ProsemirrorHelper");
var _policies = require("./../../policies");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _Diff = _interopRequireDefault(require("./components/Diff"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Email sent to a user when someone mentions them in a document.
 */
class DocumentMentionedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(_ref) {
    let {
      documentId,
      revisionId,
      userId
    } = _ref;
    const document = await _models.Document.unscoped().findByPk(documentId);
    if (!document) {
      return false;
    }
    const team = await document.$get("team");
    if (!team) {
      return false;
    }
    let currDoc = document;
    let prevDoc;
    if (revisionId) {
      const revision = await _models.Revision.findByPk(revisionId);
      if (!revision) {
        return false;
      }
      currDoc = revision;
      prevDoc = (await revision.before()) ?? undefined;
    }
    const currMentions = _DocumentHelper.DocumentHelper.parseMentions(currDoc, {
      type: _types.MentionType.User,
      modelId: userId
    });
    const prevMentions = prevDoc ? _DocumentHelper.DocumentHelper.parseMentions(prevDoc, {
      type: _types.MentionType.User,
      modelId: userId
    }) : [];
    const firstNewMention = (0, _differenceBy.default)(currMentions, prevMentions, "id")[0];
    let body;
    if (firstNewMention) {
      const node = _ProsemirrorHelper.ProsemirrorHelper.getNodeForMentionEmail(_DocumentHelper.DocumentHelper.toProsemirror(currDoc), firstNewMention);
      if (node) {
        body = await this.htmlForData(team, node);
      }
    }
    return {
      document,
      body
    };
  }
  subject(_ref2) {
    let {
      document
    } = _ref2;
    return `Mentioned you in “${document.titleWithDefault}”`;
  }
  preview(_ref3) {
    let {
      actorName
    } = _ref3;
    return `${actorName} mentioned you`;
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
      document
    } = _ref6;
    return `
You were mentioned

${actorName} mentioned you in the document “${document.titleWithDefault}”.

Open Document: ${teamUrl}${document.url}
`;
  }
  render(props) {
    const {
      document,
      actorName,
      teamUrl,
      body
    } = props;
    const documentLink = `${teamUrl}${document.url}?ref=notification-email`;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: documentLink,
        name: "View Document"
      }
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "You were mentioned"), /*#__PURE__*/React.createElement("p", null, actorName, " mentioned you in the document", " ", /*#__PURE__*/React.createElement("a", {
      href: documentLink
    }, document.titleWithDefault), "."), body && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 20
    }), /*#__PURE__*/React.createElement(_Diff.default, null, /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: body
      }
    })), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 20
    })), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: documentLink
    }, "Open Document"))));
  }
}
exports.default = DocumentMentionedEmail;