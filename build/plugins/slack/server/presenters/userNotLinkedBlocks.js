"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.presentUserNotLinkedBlocks = presentUserNotLinkedBlocks;
var _i18next = require("i18next");
var _i18n = require("./../../../../server/utils/i18n");
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentUserNotLinkedBlocks(team) {
  const appName = _env.default.APP_NAME;
  return [{
    type: "section",
    text: {
      type: "mrkdwn",
      text: (0, _i18next.t)(`It looks like you haven’t linked your {{ appName }} account to Slack yet`, {
        ...(0, _i18n.opts)(),
        appName
      }) + ". " + (team ? `<${team.url}/settings/integrations/slack|${(0, _i18next.t)("Link your account", (0, _i18n.opts)())}>` : (0, _i18next.t)("Link your account in {{ appName }} settings to search from Slack", {
        ...(0, _i18n.opts)(),
        appName
      }))
    }
  }];
}