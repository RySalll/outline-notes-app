"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _models = require("./../../models");
var _DocumentSubscriptionTask = _interopRequireDefault(require("../tasks/DocumentSubscriptionTask"));
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class DocumentSubscriptionProcessor extends _BaseProcessor.default {
  async perform(event) {
    switch (event.name) {
      case "documents.add_user":
      case "documents.remove_user":
        {
          await _DocumentSubscriptionTask.default.schedule(event);
          return;
        }
      case "documents.add_group":
      case "documents.remove_group":
        return this.handleGroup(event);
      default:
    }
  }
  async handleGroup(event) {
    const userEventName = event.name === "documents.add_group" ? "documents.add_user" : "documents.remove_user";
    await _models.GroupUser.findAllInBatches({
      where: {
        groupId: event.modelId,
        userId: {
          [_sequelize.Op.ne]: event.actorId
        }
      },
      batchLimit: 10
    }, async groupUsers => {
      await Promise.all(groupUsers.map(groupUser => _DocumentSubscriptionTask.default.schedule({
        ...event,
        name: userEventName,
        userId: groupUser.userId
      })));
    });
  }
}
exports.default = DocumentSubscriptionProcessor;
_defineProperty(DocumentSubscriptionProcessor, "applicableEvents", ["documents.add_user", "documents.remove_user", "documents.add_group", "documents.remove_group"]);