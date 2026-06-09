"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createAuthenticationProvider", _models.Team, _utils.isTeamAdmin);
(0, _cancan.allow)(_models.User, "read", _models.AuthenticationProvider, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, ["update", "delete"], _models.AuthenticationProvider, _utils.isTeamAdmin);