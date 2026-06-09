"use strict";

var _PluginManager = require("./../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _hooks = _interopRequireDefault(require("./api/hooks"));
var _slack = _interopRequireDefault(require("./auth/slack"));
var _env = _interopRequireDefault(require("./env"));
var _SlackProcessor = _interopRequireDefault(require("./processors/SlackProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const enabled = !!_env.default.SLACK_CLIENT_ID && !!_env.default.SLACK_CLIENT_SECRET;
if (enabled) {
  _PluginManager.PluginManager.add([{
    ..._plugin.default,
    type: _PluginManager.Hook.AuthProvider,
    value: {
      router: _slack.default,
      id: _plugin.default.id
    }
  }, {
    ..._plugin.default,
    type: _PluginManager.Hook.API,
    value: _hooks.default
  }, {
    type: _PluginManager.Hook.Processor,
    value: _SlackProcessor.default
  }]);
}