"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userInviter;
var _uniqBy = _interopRequireDefault(require("lodash/uniqBy"));
var _types = require("./../../shared/types");
var _InviteEmail = _interopRequireDefault(require("./../emails/templates/InviteEmail"));
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _models = require("./../models");
var _User = require("./../models/User");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function userInviter(_ref) {
  let {
    user,
    invites,
    ip
  } = _ref;
  const team = await _models.Team.findByPk(user.teamId, {
    rejectOnEmpty: true
  });

  // filter out empties and obvious non-emails
  const compactedInvites = invites.filter(invite => !!invite.email.trim() && invite.email.match("@"));
  // normalize to lowercase and remove duplicates
  const normalizedInvites = (0, _uniqBy.default)(compactedInvites.map(invite => ({
    ...invite,
    email: invite.email.toLowerCase()
  })), "email");
  // filter out any existing users in the system
  const emails = normalizedInvites.map(invite => invite.email);
  const existingUsers = await _models.User.findAll({
    where: {
      teamId: user.teamId,
      email: emails
    }
  });
  const existingEmails = existingUsers.map(user => user.email);
  const filteredInvites = normalizedInvites.filter(invite => !existingEmails.includes(invite.email));
  const users = [];

  // send and record remaining invites
  for (const invite of filteredInvites) {
    const newUser = await _models.User.create({
      teamId: user.teamId,
      name: invite.name,
      email: invite.email,
      role: user.isAdmin && invite.role === _types.UserRole.Admin ? _types.UserRole.Admin : user.isViewer || invite.role === _types.UserRole.Viewer ? _types.UserRole.Viewer : _types.UserRole.Member,
      invitedById: user.id,
      flags: {
        [_User.UserFlag.InviteSent]: 1
      }
    });
    users.push(newUser);
    await _models.Event.create({
      name: "users.invite",
      actorId: user.id,
      teamId: user.teamId,
      userId: newUser.id,
      data: {
        email: invite.email,
        name: invite.name,
        role: invite.role
      },
      ip
    });
    await new _InviteEmail.default({
      to: invite.email,
      name: invite.name,
      actorName: user.name,
      actorEmail: user.email,
      teamName: team.name,
      teamUrl: team.url
    }).schedule();
    if (_env.default.isDevelopment) {
      _Logger.default.info("email", `Sign in immediately: ${_env.default.URL}/auth/email.callback?token=${newUser.getEmailSigninToken()}`);
    }
  }
  return {
    sent: filteredInvites,
    users
  };
}