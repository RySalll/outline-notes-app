"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userUnsuspender;
var _models = require("./../models");
var _errors = require("../errors");
/**
 * This command unsuspends a previously suspended user, allowing access to the
 * team again.
 */
async function userUnsuspender(_ref) {
  let {
    user,
    actorId,
    transaction,
    ip
  } = _ref;
  if (user.id === actorId) {
    throw (0, _errors.ValidationError)("Unable to unsuspend the current user");
  }
  await user.update({
    suspendedById: null,
    suspendedAt: null
  }, {
    transaction
  });
  await _models.Event.create({
    name: "users.activate",
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
}