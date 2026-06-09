"use strict";

var _PluginManager = require("./../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _oidc = _interopRequireDefault(require("./auth/oidc"));
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!(_env.default.OIDC_CLIENT_ID && _env.default.OIDC_CLIENT_SECRET && _env.default.OIDC_AUTH_URI && _env.default.OIDC_TOKEN_URI && _env.default.OIDC_USERINFO_URI);
if (enabled) {
  _PluginManager.PluginManager.add({
    ..._plugin.default,
    type: _PluginManager.Hook.AuthProvider,
    value: {
      router: _oidc.default,
      id: _plugin.default.id
    },
    name: _env.default.OIDC_DISPLAY_NAME || _plugin.default.name
  });
}