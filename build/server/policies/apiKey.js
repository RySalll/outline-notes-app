"use strict";

var _types = require("./../../shared/types");
var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createApiKey", _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor), !actor.isViewer, !actor.isGuest, !actor.isSuspended, actor.isAdmin || !!team?.getPreference(_types.TeamPreference.MembersCanCreateApiKey)));
(0, _cancan.allow)(_models.User, "listApiKeys", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isCloudHosted)(), (0, _utils.isTeamModel)(actor, team), actor.isAdmin));
(0, _cancan.allow)(_models.User, ["read", "update", "delete"], _models.ApiKey, (actor, apiKey) => (0, _utils.and)((0, _utils.isOwner)(actor, apiKey), actor.isAdmin || !!actor.team?.getPreference(_types.TeamPreference.MembersCanCreateApiKey)));