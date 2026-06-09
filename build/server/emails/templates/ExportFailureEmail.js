"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
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
 * Email sent to a user when their data export has failed for some reason.
 */
class ExportFailureEmail extends _BaseEmail.default {
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
      userId
    } = _ref;
    return _NotificationSettingsHelper.default.unsubscribeUrl(userId, _types.NotificationEventType.ExportCompleted);
  }
  subject() {
    return "Your requested export";
  }
  preview() {
    return "Sorry, your requested data export has failed";
  }
  renderAsText() {
    return `
Your Data Export

Sorry, your requested data export has failed, please visit the admin
section to try again – if the problem persists please contact support.
`;
  }
  render(_ref2) {
    let {
      teamUrl,
      unsubscribeUrl
    } = _ref2;
    const exportLink = `${teamUrl}/settings/export`;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview()
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "Your Data Export"), /*#__PURE__*/React.createElement("p", null, "Sorry, your requested data export has failed, please visit the", " ", /*#__PURE__*/React.createElement("a", {
      href: exportLink,
      rel: "noreferrer",
      target: "_blank"
    }, "admin section"), ". to try again \u2013 if the problem persists please contact support."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 10
    }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: exportLink
    }, "Go to export"))), /*#__PURE__*/React.createElement(_Footer.default, {
      unsubscribeUrl: unsubscribeUrl
    }));
  }
}
exports.default = ExportFailureEmail;