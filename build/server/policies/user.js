"use strict";

var _types = require("./../../shared/types");
var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "read", _models.User, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, "listUsers", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamModel)(actor, team), !actor.isGuest));
(0, _cancan.allow)(_models.User, "inviteUser", _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor), !actor.isGuest, !actor.isViewer, actor.isAdmin || !!team?.getPreference(_types.TeamPreference.MembersCanInvite)));
(0, _cancan.allow)(_models.User, ["update", "readDetails", "listApiKeys"], _models.User, (actor, user) => (0, _utils.or)(
//
(0, _utils.isTeamAdmin)(actor, user), actor.id === user?.id));
(0, _cancan.allow)(_models.User, "readEmail", _models.User, (actor, user) => (0, _utils.or)(
//
(0, _utils.isTeamAdmin)(actor, user), (0, _utils.isTeamMember)(actor, user), actor.id === user?.id));
(0, _cancan.allow)(_models.User, "delete", _models.User, (actor, user) => (0, _utils.or)((0, _utils.isTeamAdmin)(actor, user), (0, _utils.and)(actor.id === user?.id, !!actor.team.getPreference(_types.TeamPreference.MembersCanDeleteAccount))));
(0, _cancan.allow)(_models.User, ["activate", "suspend"], _models.User, _utils.isTeamAdmin);
(0, _cancan.allow)(_models.User, "promote", _models.User, (actor, user) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, user), !user?.isAdmin, !user?.isSuspended));
(0, _cancan.allow)(_models.User, "demote", _models.User, (actor, user) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, user), !user?.isSuspended));
(0, _cancan.allow)(_models.User, "resendInvite", _models.User, (actor, user) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, user), !!user?.isInvited));