"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, ["read", "update", "delete"], _models.Star, _utils.isOwner);