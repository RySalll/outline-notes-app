"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
var _env = _interopRequireDefault(require("./../../env"));
var _NotificationSettingsHelper = _interopRequireDefault(require("./../../models/helpers/NotificationSettingsHelper"));
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _Button = _interopRequireDefault(require("./components/Button"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Email sent to a user when someone they invited successfully signs up.
 */
class InviteAcceptedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(props) {
    return {
      unsubscribeUrl: this.unsubscribeUrl(props)
    };
  }
  unsubscribeUrl(_ref) {
    let {
      inviterId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(inviterId, _types.NotificationEventType.InviteAccepted);
  }
  subject(_ref2) {
    let {
      invitedName
    } = _ref2;
    return `${invitedName} has joined your ${_env.default.APP_NAME} team`;
  }
  preview(_ref3) {
    let {
      invitedName
    } = _ref3;
    return `Great news, ${invitedName}, accepted your invitation`;
  }
  renderAsText(_ref4) {
    let {
      invitedName,
      teamUrl
    } = _ref4;
    return `
Great news, ${invitedName} just accepted your invitation and has created an account. You can now start collaborating on documents.

Open ${_env.default.APP_NAME}: ${teamUrl}
`;
  }
  render(_ref5) {
    let {
      invitedName,
      teamUrl,
      unsubscribeUrl
    } = _ref5;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview({
        invitedName
      })
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, invitedName, " has joined your team"), /*#__PURE__*/React.createElement("p", null, "Great news, ", invitedName, " just accepted your invitation and has created an account. You can now start collaborating on documents."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 10
    }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: teamUrl
    }, "Open ", _env.default.APP_NAME))), /*#__PURE__*/React.createElement(_Footer.default, {
      unsubscribeUrl: unsubscribeUrl
    }));
  }
}
exports.default = InviteAcceptedEmail;