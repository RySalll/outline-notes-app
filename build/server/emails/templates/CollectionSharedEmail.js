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
 * Email sent to a user when someone adds them to a collection.
 */
class CollectionSharedEmail extends _BaseEmail.default {
  get category() {
    return _BaseEmail.EmailMessageCategory.Notification;
  }
  async beforeSend(_ref) {
    let {
      userId,
      collectionId
    } = _ref;
    const collection = await _models.Collection.findByPk(collectionId);
    if (!collection) {
      return false;
    }
    const membership = await _models.UserMembership.findOne({
      where: {
        collectionId,
        userId
      }
    });
    if (!membership) {
      return false;
    }
    return {
      collection,
      membership
    };
  }
  subject(_ref2) {
    let {
      actorName,
      collection
    } = _ref2;
    return `${actorName} invited you to the “${collection.name}” collection`;
  }
  preview(_ref3) {
    let {
      actorName
    } = _ref3;
    return `${actorName} invited you to a collection`;
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
      collection
    } = _ref5;
    return `
${actorName} invited you to the “${collection.name}” collection.

View Document: ${teamUrl}${collection.path}
`;
  }
  render(props) {
    const {
      collection,
      membership,
      actorName,
      teamUrl
    } = props;
    const collectionUrl = `${teamUrl}${collection.path}?ref=notification-email`;
    const permission = membership.permission === _types.CollectionPermission.ReadWrite ? "view and edit" : membership.permission === _types.CollectionPermission.Admin ? "manage" : "view";
    return /*#__PURE__*/React.createElement(_EmailLayout.default, {
      previewText: this.preview(props),
      goToAction: {
        url: collectionUrl,
        name: "View Collection"
      }
    }, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, collection.name), /*#__PURE__*/React.createElement("p", null, actorName, " invited you to ", permission, " documents in the", " ", /*#__PURE__*/React.createElement("a", {
      href: collectionUrl
    }, collection.name), " collection."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
      href: collectionUrl
    }, "View Collection"))));
  }
}
exports.default = CollectionSharedEmail;