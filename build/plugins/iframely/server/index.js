"use strict";

var _time = require("./../../../shared/utils/time");
var _PluginManager = require("./../../../server/utils/PluginManager");
var _env = _interopRequireDefault(require("./env"));
var _iframely = _interopRequireDefault(require("./iframely"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const isDefaultHost = _env.default.IFRAMELY_URL === _iframely.default.defaultUrl;

// To be considered enabled either we're using the default (cloud) host and have an API key,
// or we're using a custom host where no API key is required.
const enabled = isDefaultHost && !!_env.default.IFRAMELY_API_KEY || !isDefaultHost && !!_env.default.IFRAMELY_URL;
if (enabled) {
  _PluginManager.PluginManager.add([{
    type: _PluginManager.Hook.UnfurlProvider,
    value: {
      unfurl: _iframely.default.unfurl,
      cacheExpiry: _time.Day.seconds
    },
    // Make sure this is last in the stack to be evaluated after all other unfurl providers
    priority: _PluginManager.PluginPriority.VeryLow
  }]);
}