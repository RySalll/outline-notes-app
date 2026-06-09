"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _subscriptionCreator = _interopRequireDefault(require("./../../commands/subscriptionCreator"));
var _context = require("./../../context");
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _BaseTask = _interopRequireDefault(require("./BaseTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentSubscriptionTask extends _BaseTask.default {
  async perform(event) {
    const user = await _models.User.findByPk(event.userId);
    if (!user) {
      return;
    }
    switch (event.name) {
      case "documents.add_user":
        return this.addUser(event, user);
      case "documents.remove_user":
        return this.removeUser(event, user);
      default:
    }
  }
  async addUser(event, user) {
    await _database.sequelize.transaction(async transaction => {
      await (0, _subscriptionCreator.default)({
        ctx: (0, _context.createContext)({
          user,
          authType: event.authType,
          ip: event.ip,
          transaction
        }),
        documentId: event.documentId,
        event: "documents.update",
        resubscribe: false
      });
    });
  }
  async removeUser(event, user) {
    await _database.sequelize.transaction(async transaction => {
      const subscription = await _models.Subscription.findOne({
        where: {
          userId: user.id,
          documentId: event.documentId,
          event: "documents.update"
        },
        transaction,
        lock: _sequelize.Transaction.LOCK.UPDATE
      });
      await subscription?.destroyWithCtx((0, _context.createContext)({
        user,
        authType: event.authType,
        ip: event.ip,
        transaction
      }));
    });
  }
}
exports.default = DocumentSubscriptionTask;