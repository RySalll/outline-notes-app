"use strict";

var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createComment", _models.Team, _utils.isTeamModel);
(0, _cancan.allow)(_models.User, "read", _models.Comment, (actor, comment) => (0, _utils.isTeamModel)(actor, comment?.createdBy));
(0, _cancan.allow)(_models.User, "resolve", _models.Comment, (actor, comment) => (0, _utils.and)((0, _utils.isTeamModel)(actor, comment?.createdBy), comment?.parentCommentId === null, comment?.resolvedById === null));
(0, _cancan.allow)(_models.User, "unresolve", _models.Comment, (actor, comment) => (0, _utils.and)((0, _utils.isTeamModel)(actor, comment?.createdBy), comment?.parentCommentId === null, comment?.resolvedById !== null));
(0, _cancan.allow)(_models.User, ["update", "delete"], _models.Comment, (actor, comment) => (0, _utils.and)((0, _utils.isTeamModel)(actor, comment?.createdBy), (0, _utils.or)(actor.isAdmin, actor?.id === comment?.createdById)));
(0, _cancan.allow)(_models.User, ["readReaction", "addReaction", "removeReaction"], _models.Comment, (actor, comment) => (0, _utils.isTeamModel)(actor, comment?.createdBy));