"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "read", _models.Team, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, "share", _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamModel)(actor, team), !actor.isGuest, !actor.isViewer, !!team?.sharing));
(0, _cancan.allow)(_models.User, "createTeam", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isCloudHosted)(), !actor.isGuest, !actor.isViewer, (0, _utils.or)(actor.isAdmin, !!team?.memberTeamCreate)));
(0, _cancan.allow)(_models.User, "update", _models.Team, _utils.isTeamAdmin);
(0, _cancan.allow)(_models.User, ["delete", "audit"], _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isCloudHosted)(), (0, _utils.isTeamAdmin)(actor, team)));
(0, _cancan.allow)(_models.User, "createTemplate", _models.Team, (actor, team) => (0, _utils.and)(
//
!actor.isGuest, !actor.isViewer, (0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "readTemplate", _models.Team, (actor, team) => (0, _utils.and)(!actor.isViewer, (0, _utils.isTeamModel)(actor, team)));
(0, _cancan.allow)(_models.User, "updateTemplate", _models.Team, (actor, team) => (0, _utils.and)(
//
actor.isAdmin, (0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor)));