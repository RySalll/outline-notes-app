"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createWebhookSubscription", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, team), (0, _utils.isTeamMutable)(actor), !actor.isSuspended));
(0, _cancan.allow)(_models.User, "listWebhookSubscription", _models.Team, _utils.isTeamAdmin);
(0, _cancan.allow)(_models.User, ["read", "update", "delete"], _models.WebhookSubscription, _utils.isTeamAdmin);