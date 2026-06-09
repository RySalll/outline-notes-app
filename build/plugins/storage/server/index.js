"use strict";

var _fs = require("fs");
var _env = _interopRequireDefault(require("./../../../server/env"));
var _Logger = _interopRequireDefault(require("./../../../server/logging/Logger"));
var _PluginManager = require("./../../../server/utils/PluginManager");
var _files = _interopRequireDefault(require("./api/files"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
if (_env.default.FILE_STORAGE === "local") {
  const rootDir = _env.default.FILE_STORAGE_LOCAL_ROOT_DIR;
  try {
    if (!(0, _fs.existsSync)(rootDir)) {
      (0, _fs.mkdirSync)(rootDir, {
        recursive: true
      });
      _Logger.default.debug("utils", `Created ${rootDir} for local storage`);
    }
  } catch (err) {
    _Logger.default.fatal(`Failed to create directory for local file storage at ${_env.default.FILE_STORAGE_LOCAL_ROOT_DIR}`, err);
  }
}
const enabled = !!(_env.default.FILE_STORAGE_UPLOAD_MAX_SIZE && _env.default.FILE_STORAGE_LOCAL_ROOT_DIR && _env.default.FILE_STORAGE === "local");
if (enabled) {
  _PluginManager.PluginManager.add([{
    name: "Local file storage",
    description: "Plugin for storing files on the local file system",
    type: _PluginManager.Hook.API,
    value: _files.default,
    priority: _PluginManager.PluginPriority.Normal
  }]);
}