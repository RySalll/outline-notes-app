"use strict";

var _PluginManager = require("./../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _azure = _interopRequireDefault(require("./auth/azure"));
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.AZURE_CLIENT_ID && !!_env.default.AZURE_CLIENT_SECRET;
if (enabled) {
  _PluginManager.PluginManager.add({
    ..._plugin.default,
    type: _PluginManager.Hook.AuthProvider,
    value: {
      router: _azure.default,
      id: _plugin.default.id
    }
  });
}