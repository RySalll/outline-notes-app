"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiscordGuildError = DiscordGuildError;
exports.DiscordGuildRoleError = DiscordGuildRoleError;
var _httpErrors = _interopRequireDefault(require("http-errors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function DiscordGuildError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "User is not a member of the required Discord server";
  return (0, _httpErrors.default)(400, message, {
    id: "discord_guild_error"
  });
}
function DiscordGuildRoleError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "User does not have the required role from the Discord server";
  return (0, _httpErrors.default)(400, message, {
    id: "discord_guild_role_error"
  });
}