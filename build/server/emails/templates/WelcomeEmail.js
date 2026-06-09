"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
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
 * Email sent to a user when their account has just been created, or they signed
 * in for the first time from an invite.
 */
class WelcomeEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  subject() {
    return `Welcome to ${_env.default.APP_NAME}`;
  }
  async beforeSend(props) {
    if (props.role === _types.UserRole.Guest) {
      return false;
    }
    return {};
  }
  preview() {
    return `${_env.default.APP_NAME} is a place for your team to build and share knowledge.`;
  }
  renderAsText(_ref) {
    let {
      teamUrl
    } = _ref;
    return `
Welcome to ${_env.default.APP_NAME}!

${_env.default.APP_NAME} is a place for your team to build and share knowledge.

To get started, head to the home screen and try creating a collection to help document your processes, create playbooks, or plan your team's work.

Or, learn more about everything Outline can do in the guide:
https://docs.getoutline.com/s/guide

${teamUrl}/home
`;
  }
  render(_ref2) {
    let {
      teamUrl
    } = _ref2;
    const welcomeLink = `${teamUrl}/home?ref=welcome-email`;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview()
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "Welcome to ", _env.default.APP_NAME, "!"), /*#__PURE__*/React.createElement("p", null, _env.default.APP_NAME, " is a place for your team to build and share knowledge."), /*#__PURE__*/React.createElement("p", null, "To get started, head to the home screen and try creating a collection to help document your processes, create playbooks, or plan your teams work."), /*#__PURE__*/React.createElement("p", null, "Or, learn more about everything Outline can do in", " ", /*#__PURE__*/React.createElement("a", {
      href: "https://docs.getoutline.com/s/guide"
    }, "the guide"), "."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 10
    }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: welcomeLink
    }, "Open ", _env.default.APP_NAME))), /*#__PURE__*/React.createElement(_Footer.default, null));
  }
}
exports.default = WelcomeEmail;