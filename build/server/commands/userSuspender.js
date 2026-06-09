"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userSuspender;
var _models = require("./../models");
var _CleanupDemotedUserTask = _interopRequireDefault(require("./../queues/tasks/CleanupDemotedUserTask"));
var _errors = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This command suspends an active user, this will cause them to lose access to
 * the team.
 */
async function userSuspender(_ref) {
  let {
    user,
    actorId,
    transaction,
    ip
  } = _ref;
  if (user.id === actorId) {
    throw (0, _errors.ValidationError)("Unable to suspend the current user");
  }
  await user.update({
    suspendedById: actorId,
    suspendedAt: new Date()
  }, {
    transaction
  });
  await _models.GroupUser.destroy({
    where: {
      userId: user.id
    },
    transaction,
    individualHooks: true
  });
  await _models.Event.create({
    name: "users.suspend",
    actorId,
    userId: user.id,
    teamId: user.teamId,
    data: {
      name: user.name
    },
    ip
  }, {
    transaction
  });
  await _CleanupDemotedUserTask.default.schedule({
    userId: user.id
  });
}