"use strict";

var _PluginManager = require("./../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _google = _interopRequireDefault(require("./auth/google"));
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.GOOGLE_CLIENT_ID && !!_env.default.GOOGLE_CLIENT_SECRET;
if (enabled) {
  _PluginManager.PluginManager.add({
    ..._plugin.default,
    type: _PluginManager.Hook.AuthProvider,
    value: {
      router: _google.default,
      id: _plugin.default.id
    }
  });
}