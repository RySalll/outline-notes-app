"use strict";

var _time = require("./../../../shared/utils/time");
var _PluginManager = require("./../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _github = _interopRequireDefault(require("./api/github"));
var _env = _interopRequireDefault(require("./env"));
var _github2 = require("./github");
var _uninstall = require("./uninstall");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.GITHUB_CLIENT_ID && !!_env.default.GITHUB_CLIENT_SECRET && !!_env.default.GITHUB_APP_NAME && !!_env.default.GITHUB_APP_ID && !!_env.default.GITHUB_APP_PRIVATE_KEY;
if (enabled) {
  _PluginManager.PluginManager.add([{
    ..._plugin.default,
    type: _PluginManager.Hook.API,
    value: _github.default
  }, {
    type: _PluginManager.Hook.UnfurlProvider,
    value: {
      unfurl: _github2.GitHub.unfurl,
      cacheExpiry: _time.Minute.seconds
    }
  }, {
    type: _PluginManager.Hook.Uninstall,
    value: _uninstall.uninstall
  }]);
}