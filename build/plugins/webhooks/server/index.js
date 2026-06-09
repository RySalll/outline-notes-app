"use strict";

var _PluginManager = require("./../../../server/utils/PluginManager");
var _plugin = _interopRequireDefault(require("../plugin.json"));
var _webhookSubscriptions = _interopRequireDefault(require("./api/webhookSubscriptions"));
var _WebhookProcessor = _interopRequireDefault(require("./processors/WebhookProcessor"));
var _CleanupWebhookDeliveriesTask = _interopRequireDefault(require("./tasks/CleanupWebhookDeliveriesTask"));
var _DeliverWebhookTask = _interopRequireDefault(require("./tasks/DeliverWebhookTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_PluginManager.PluginManager.add([{
  ..._plugin.default,
  type: _PluginManager.Hook.API,
  value: _webhookSubscriptions.default
}, {
  type: _PluginManager.Hook.Processor,
  value: _WebhookProcessor.default
}, {
  type: _PluginManager.Hook.Task,
  value: _DeliverWebhookTask.default
}, {
  type: _PluginManager.Hook.Task,
  value: _CleanupWebhookDeliveriesTask.default
}]);