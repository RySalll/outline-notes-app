"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class UserDeletedProcessor extends _BaseProcessor.default {
  async perform(event) {
    await _database.sequelize.transaction(async transaction => {
      await _models.GroupUser.destroy({
        where: {
          userId: event.userId
        },
        transaction,
        individualHooks: true
      });
      await _models.UserAuthentication.destroy({
        where: {
          userId: event.userId
        },
        transaction
      });
      await _models.UserMembership.destroy({
        where: {
          userId: event.userId
        },
        transaction
      });
      await _models.Subscription.destroy({
        where: {
          userId: event.userId
        },
        transaction
      });
      await _models.ApiKey.destroy({
        where: {
          userId: event.userId
        },
        transaction
      });
      await _models.Star.destroy({
        where: {
          userId: event.userId
        },
        transaction
      });
    });
  }
}
exports.default = UserDeletedProcessor;
_defineProperty(UserDeletedProcessor, "applicableEvents", ["users.delete"]);