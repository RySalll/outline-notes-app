"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
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
 * Email sent to the creator of a webhook when the webhook has become disabled
 * due to repeated failure.
 */
class WebhookDisabledEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  subject() {
    return `Warning: Webhook disabled`;
  }
  preview(_ref) {
    let {
      webhookName
    } = _ref;
    return `Your webhook (${webhookName}) has been disabled`;
  }
  renderAsText(_ref2) {
    let {
      webhookName,
      teamUrl
    } = _ref2;
    return `
Your webhook (${webhookName}) has been automatically disabled as the last 25
delivery attempts have failed. You can re-enable by editing the webhook.

Webhook settings: ${teamUrl}/settings/webhooks
`;
  }
  render(props) {
    const {
      webhookName,
      teamUrl
    } = props;
    const webhookSettingsLink = `${teamUrl}/settings/webhooks`;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview(props)
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "Webhook disabled"), /*#__PURE__*/React.createElement("p", null, "Your webhook (", webhookName, ") has been automatically disabled as the last 25 delivery attempts have failed. You can re-enable by editing the webhook."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 10
    }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: webhookSettingsLink
    }, "Webhook settings"))), /*#__PURE__*/React.createElement(_Footer.default, null));
  }
}
exports.default = WebhookDisabledEmail;