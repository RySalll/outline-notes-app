"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentProviderConfig;
var _routeHelpers = require("./../../shared/utils/routeHelpers");
function presentProviderConfig(config) {
  return {
    id: config.value.id,
    name: config.name,
    authUrl: (0, _routeHelpers.signin)(config.value.id)
  };
}