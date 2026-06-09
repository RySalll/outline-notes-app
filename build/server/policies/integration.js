"use strict";

var _types = require("./../../shared/types");
var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createIntegration", _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamAdmin)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "read", _models.Integration, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, ["update", "delete"], _models.Integration, (actor, integration) => (0, _utils.and)((0, _utils.isTeamModel)(actor, integration), (0, _utils.isTeamMutable)(actor), !actor.isGuest, !actor.isViewer, (0, _utils.or)(actor.isAdmin, (0, _utils.isOwner)(actor, integration) && integration.type === _types.IntegrationType.LinkedAccount)));