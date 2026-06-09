"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentUser;
var _env = _interopRequireDefault(require("./../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentUser(user) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const userData = {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    color: user.color,
    role: user.role,
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastActiveAt: user.lastActiveAt,
    timezone: user.timezone
  };
  if (options.includeDetails) {
    userData.email = user.email;
    userData.language = user.language || _env.default.DEFAULT_LANGUAGE;
    userData.preferences = user.preferences;
    userData.notificationSettings = user.notificationSettings;
  }
  if (options.includeEmail) {
    userData.email = user.email;
  }
  return userData;
}