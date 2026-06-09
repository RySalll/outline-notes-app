"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _policies = require("./../../policies");
var _database = require("./../../storage/database");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Task to disable mechanisms for exporting data from a suspended or demoted user,
 * currently this is done by destroying associated Api Keys and disabling webhooks.
 */
class CleanupDemotedUserTask extends _BaseTask.default {
  async perform(props) {
    const user = await _models.User.scope("withTeam").findByPk(props.userId, {
      rejectOnEmpty: true
    });
    await _database.sequelize.transaction(async transaction => {
      if ((0, _policies.cannot)(user, "createWebhookSubscription", user.team)) {
        const subscriptions = await _models.WebhookSubscription.findAll({
          where: {
            createdById: props.userId,
            enabled: true
          },
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        await Promise.all(subscriptions.map(subscription => subscription.disable({
          transaction
        })));
        _Logger.default.info("task", `Disabled ${subscriptions.length} webhooks for user ${props.userId}`);
      }
      if ((0, _policies.cannot)(user, "createApiKey", user.team)) {
        const apiKeys = await _models.ApiKey.findAll({
          where: {
            userId: props.userId
          },
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        await Promise.all(apiKeys.map(apiKey => apiKey.destroy({
          transaction
        })));
        _Logger.default.info("task", `Destroyed ${apiKeys.length} api keys for user ${props.userId}`);
      }
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CleanupDemotedUserTask;