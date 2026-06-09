"use strict";

var _env = _interopRequireDefault(require("./../../../server/env"));
var _PluginManager = require("./../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _email = _interopRequireDefault(require("./auth/email"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.SMTP_HOST || _env.default.isDevelopment;
if (enabled) {
  _PluginManager.PluginManager.add({
    ..._plugin.default,
    type: _PluginManager.Hook.AuthProvider,
    value: {
      router: _email.default,
      id: _plugin.default.id
    }
  });
}