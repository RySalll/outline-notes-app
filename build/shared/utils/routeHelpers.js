"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.integrationSettingsPath = integrationSettingsPath;
exports.settingsPath = settingsPath;
exports.signin = signin;
function signin() {
  let service = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "slack";
  return `/auth/${service}`;
}
function settingsPath(section) {
  return "/settings" + (section ? `/${section}` : "");
}
function integrationSettingsPath(id) {
  return `/settings/integrations/${id}`;
}