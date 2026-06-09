"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, ["update", "delete"], _models.UserMembership, (actor, membership) => (0, _utils.or)(
//
(0, _utils.isOwner)(actor, membership), actor.isAdmin));