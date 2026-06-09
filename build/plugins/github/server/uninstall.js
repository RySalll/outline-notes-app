"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uninstall = uninstall;
var _types = require("./../../../shared/types");
var _github = require("./github");
async function uninstall(integration) {
  if (integration.service === _types.IntegrationService.GitHub) {
    const installationId = integration.settings?.github?.installation.id;
    if (installationId) {
      const client = await _github.GitHub.authenticateAsInstallation(installationId);
      await client.requestAppUninstall(installationId);
    }
  }
}