"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _env = _interopRequireDefault(require("./../../env"));
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
 * Email sent to a user when they request to change their email.
 */
class ConfirmUpdateEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Authentication;
  }
  subject() {
    return `Your email update request`;
  }
  preview() {
    return `Here’s your email change confirmation.`;
  }
  renderAsText(_ref) {
    let {
      teamUrl,
      code,
      previous,
      to
    } = _ref;
    return `
You requested to update your ${_env.default.APP_NAME} account email. Please
follow the link below to confirm the change ${previous ? `from ${previous} ` : ""}to ${to}.

  ${this.updateLink(teamUrl, code)}
  `;
  }
  render(_ref2) {
    let {
      teamUrl,
      code,
      previous,
      to
    } = _ref2;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview()
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "Your email update request"), /*#__PURE__*/React.createElement("p", null, "You requested to update your ", _env.default.APP_NAME, " account email. Please click below to confirm the change", " ", previous ? `from ${previous} ` : "", "to ", /*#__PURE__*/React.createElement("strong", null, to), "."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 5
    }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: this.updateLink(teamUrl, code)
    }, "Confirm Change"))), /*#__PURE__*/React.createElement(_Footer.default, null));
  }
  updateLink(teamUrl, code) {
    return `${teamUrl}/api/users.updateEmail?code=${code}`;
  }
}
exports.default = ConfirmUpdateEmail;