"use strict";

var _types = require("./../../shared/types");
var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, ["createFileOperation", "createImport", "createExport"], _models.Team,
// Note: Not checking for isTeamMutable here because we want to allow exporting data in read-only.
_utils.isTeamAdmin);
(0, _cancan.allow)(_models.User, "read", _models.FileOperation, _utils.isTeamAdmin);
(0, _cancan.allow)(_models.User, "delete", _models.FileOperation, (actor, fileOperation) => (0, _utils.and)((0, _utils.isTeamAdmin)(actor, fileOperation), (0, _utils.isTeamMutable)(actor), (0, _utils.or)(fileOperation?.type !== _types.FileOperationType.Export, fileOperation?.state === _types.FileOperationState.Complete)));