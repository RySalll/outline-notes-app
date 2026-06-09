"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _InviteReminderEmail = _interopRequireDefault(require("./../../emails/templates/InviteReminderEmail"));
var _models = require("./../../models");
var _User = require("./../../models/User");
var _database = require("./../../storage/database");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class InviteReminderTask extends _BaseTask.default {
  async perform() {
    const users = await _models.User.scope("invited").findAll({
      attributes: ["id"],
      where: {
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subDays)(new Date(), 2),
          [_sequelize.Op.gt]: (0, _dateFns.subDays)(new Date(), 3)
        }
      }
    });
    const userIds = users.map(user => user.id);
    for (const userId of userIds) {
      await _database.sequelize.transaction(async transaction => {
        const user = await _models.User.scope("withTeam").findByPk(userId, {
          lock: {
            level: transaction.LOCK.UPDATE,
            of: _models.User
          },
          transaction
        });
        const invitedBy = user?.invitedById ? await _models.User.findByPk(user?.invitedById, {
          transaction
        }) : undefined;
        if (user && invitedBy && user.getFlag(_User.UserFlag.InviteReminderSent) === 0) {
          await new _InviteReminderEmail.default({
            to: user.email,
            name: user.name,
            actorName: invitedBy.name,
            actorEmail: invitedBy.email,
            teamName: user.team.name,
            teamUrl: user.team.url
          }).schedule();
          user.incrementFlag(_User.UserFlag.InviteReminderSent);
          await user.save({
            transaction
          });
        }
      });
    }
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = InviteReminderTask;
_defineProperty(InviteReminderTask, "cron", _BaseTask.TaskSchedule.Daily);