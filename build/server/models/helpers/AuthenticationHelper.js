"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _find = _interopRequireDefault(require("lodash/find"));
var _env = _interopRequireDefault(require("./../../env"));
var _PluginManager = require("./../../utils/PluginManager");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable @typescript-eslint/no-var-requires */

class AuthenticationHelper {
  /**
   * Returns the enabled authentication provider configurations for the current
   * installation.
   *
   * @returns A list of authentication providers
   */
  static get providers() {
    return _PluginManager.PluginManager.getHooks(_PluginManager.Hook.AuthProvider);
  }

  /**
   * Returns the enabled authentication provider configurations for a team,
   * if given otherwise all enabled providers are returned.
   *
   * @param team The team to get enabled providers for
   * @returns A list of authentication providers
   */
  static providersForTeam(team) {
    const isCloudHosted = _env.default.isCloudHosted;
    return AuthenticationHelper.providers.sort(hook => hook.value.id === "email" ? 1 : -1).filter(hook => {
      // Email sign-in is an exception as it does not have an authentication
      // provider using passport, instead it exists as a boolean option.
      if (hook.value.id === "email") {
        return team?.emailSigninEnabled;
      }

      // If no team return all possible authentication providers except email.
      if (!team) {
        return true;
      }
      const authProvider = (0, _find.default)(team.authenticationProviders, {
        name: hook.value.id
      });

      // If cloud hosted then the auth provider must be enabled for the team,
      // If self-hosted then it must not be actively disabled, otherwise all
      // providers are considered.
      return !isCloudHosted && authProvider?.enabled !== false || isCloudHosted && authProvider?.enabled;
    });
  }
}
exports.default = AuthenticationHelper;