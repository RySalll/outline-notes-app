"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserRoleHelper = void 0;
var _types = require("../types");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class UserRoleHelper {
  /**
   * Get the display name for a role.
   *
   * @param role The role to get the display name for
   * @param t The translation function
   * @returns The display name for the role
   */
  static displayName(role, t) {
    switch (role) {
      case _types.UserRole.Guest:
        return t("Guest");
      case _types.UserRole.Viewer:
        return t("Viewer");
      case _types.UserRole.Member:
        return t("Editor");
      case _types.UserRole.Admin:
        return t("Admin");
    }
  }

  /**
   * Check if the first role is higher than the second role.
   *
   * @param role The role to check
   * @param otherRole The role to compare against
   * @returns `true` if the first role is higher than the second role, `false` otherwise
   */
  static isRoleHigher(role, otherRole) {
    return this.roles.indexOf(role) > this.roles.indexOf(otherRole);
  }

  /**
   * Check if the first role is lower than the second role.
   *
   * @param role The role to check
   * @param otherRole The role to compare against
   * @returns `true` if the first role is lower than the second role, `false` otherwise
   */
  static isRoleLower(role, otherRole) {
    return this.roles.indexOf(role) < this.roles.indexOf(otherRole);
  }

  /**
   * Check if the users role is lower than the given role. This does not authorize the operation.
   *
   * @param user The user to check
   * @param role The role to compare against
   * @returns `true` if the users role is lower than the given role, `false` otherwise
   */
  static canPromote(user, role) {
    return this.isRoleHigher(role, user.role);
  }

  /**
   * Check if the users role is higher than the given role. This does not authorize the operation.
   *
   * @param user The user to check
   * @param role The role to compare against
   * @returns `true` if the users role is higher than the given role, `false` otherwise
   */
  static canDemote(user, role) {
    return this.isRoleLower(role, user.role);
  }

  /**
   * List of all roles in order from lowest to highest.
   */
}
exports.UserRoleHelper = UserRoleHelper;
_defineProperty(UserRoleHelper, "roles", [_types.UserRole.Guest, _types.UserRole.Viewer, _types.UserRole.Member, _types.UserRole.Admin]);