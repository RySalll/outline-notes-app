"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createAttachment", _models.Team, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, ["read", "update", "delete"], _models.Attachment, (actor, attachment) => (0, _utils.and)((0, _utils.isTeamModel)(actor, attachment), (0, _utils.or)(actor.isAdmin, (0, _utils.isOwner)(actor, attachment))));