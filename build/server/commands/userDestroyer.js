"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userDestroyer;
var _sequelize = require("sequelize");
var _types = require("./../../shared/types");
var _models = require("./../models");
var _errors = require("../errors");
async function userDestroyer(ctx, _ref) {
  let {
    user
  } = _ref;
  const {
    transaction
  } = ctx.state;
  const {
    teamId
  } = user;
  const usersCount = await _models.User.count({
    where: {
      teamId
    },
    transaction
  });
  if (usersCount === 1) {
    throw (0, _errors.ValidationError)("Cannot delete last user on the team, delete the workspace instead.");
  }
  if (user.isAdmin) {
    const otherAdminsCount = await _models.User.count({
      where: {
        role: _types.UserRole.Admin,
        teamId,
        id: {
          [_sequelize.Op.ne]: user.id
        }
      },
      transaction
    });
    if (otherAdminsCount === 0) {
      throw (0, _errors.ValidationError)("Cannot delete account as only admin. Please make another user admin and try again.");
    }
  }
  await _models.Event.createFromContext(ctx, {
    name: "users.delete",
    userId: user.id,
    data: {
      name: user.name
    }
  });
  return user.destroy({
    transaction
  });
}