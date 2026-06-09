"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createShare", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor), !actor.isGuest));
(0, _cancan.allow)(_models.User, "listShares", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamModel)(actor, team), !actor.isGuest));
(0, _cancan.allow)(_models.User, "read", _models.Share, (actor, share) => (0, _utils.and)(
//
(0, _utils.isTeamModel)(actor, share), !actor.isGuest));
(0, _cancan.allow)(_models.User, "update", _models.Share, (actor, share) => (0, _utils.and)((0, _utils.isTeamModel)(actor, share), !actor.isGuest, !actor.isViewer, (0, _cancan.can)(actor, "share", share?.document)));
(0, _cancan.allow)(_models.User, "revoke", _models.Share, (actor, share) => (0, _utils.and)((0, _utils.isTeamModel)(actor, share), !actor.isGuest, !actor.isViewer, (0, _utils.or)(actor.isAdmin, (0, _utils.isOwner)(actor, share))));