"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _env = _interopRequireDefault(require("./../../env"));
var _BaseEmail = _interopRequireWildcard(require("./BaseEmail"));
var _Body = _interopRequireDefault(require("./components/Body"));
var _CopyableCode = _interopRequireDefault(require("./components/CopyableCode"));
var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));
var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));
var _Footer = _interopRequireDefault(require("./components/Footer"));
var _Header = _interopRequireDefault(require("./components/Header"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Email sent to a user when they request to delete their workspace.
 */
class ConfirmTeamDeleteEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  subject() {
    return `Your workspace deletion request`;
  }
  preview() {
    return `Your requested workspace deletion code`;
  }
  renderAsText(_ref) {
    let {
      deleteConfirmationCode
    } = _ref;
    return `
You requested to permanently delete your ${_env.default.APP_NAME} workspace. Please enter the code below to confirm the workspace deletion.

Code: ${deleteConfirmationCode}
`;
  }
  render(_ref2) {
    let {
      deleteConfirmationCode
    } = _ref2;
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview()
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "Your workspace deletion request"), /*#__PURE__*/React.createElement("p", null, "You requested to permanently delete your ", _env.default.APP_NAME, " workspace. Please enter the code below to confirm your workspace deletion."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
      height: 5
    }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_CopyableCode.default, null, deleteConfirmationCode))), /*#__PURE__*/React.createElement(_Footer.default, null));
  }
}
exports.default = ConfirmTeamDeleteEmail;