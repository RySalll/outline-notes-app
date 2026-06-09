"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
var _models = require("./../../models");
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Email sent to a user when someone adds them to a document.
 */
class DocumentSharedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(_ref) {
    let {
      documentId,
      userId
    } = _ref;
    const document = await _models.Document.unscoped().findByPk(documentId);
    if (!document) {
      return false;
    }
    const membership = await _models.UserMembership.findOne({
      where: {
        documentId,
        userId
      }
    });
    if (!membership) {
      return false;
    }
    return {
      document,
      membership
    };
  }
  subject(_ref2) {
    let {
      actorName,
      document
    } = _ref2;
    return `${actorName} shared “${document.titleWithDefault}” with you`;
  }
  preview(_ref3) {
    let {
      actorName
    } = _ref3;
    return `${actorName} shared a document`;
  }
  fromName(_ref4) {
    let {
      actorName
    } = _ref4;
    return actorName;
  }
  renderAsText(_ref5) {
    let {
      actorName,
      teamUrl,
      document
    } = _ref5;
    return `
${actorName} shared “${document.titleWithDefault}” with you.

View Document: ${teamUrl}${document.path}
`;
  }
  render(props) {
    const {
      document,
      membership,
      actorName,
      teamUrl
    } = props;
    const documentUrl = `${teamUrl}${document.path}?ref=notification-email`;
    const permission = membership.permission === _types.DocumentPermission.Read ? "view" : "edit";
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: documentUrl,
        name: "View Document"
      }
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, document.titleWithDefault), /*#__PURE__*/React.createElement("p", null, actorName, " invited you to ", permission, " the", " ", /*#__PURE__*/React.createElement("a", {
      href: documentUrl
    }, document.titleWithDefault), " document."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: documentUrl
    }, "View Document"))));
  }
}
exports.default = DocumentSharedEmail;