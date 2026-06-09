"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _types = require("./../../../shared/types");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class ApiKeyCleanupProcessor extends _BaseProcessor.default {
  async perform(event) {
    // If the team preference to allow members to create API keys has been disabled, we need to
    // clean up any existing API keys created by non-admins as they are no longer valid.
    if (event.changes?.attributes.preferences?.[_types.TeamPreference.MembersCanCreateApiKey] === false) {
      const userIds = (await _models.User.findAll({
        attributes: ["id"],
        where: {
          teamId: event.teamId,
          role: {
            [_sequelize.Op.ne]: _types.UserRole.Admin
          }
        }
      })).map(u => u.id);
      const count = await _models.ApiKey.destroy({
        where: {
          userId: userIds
        }
      });
      _Logger.default.info("processor", `Deleted ${count} API keys for non-admin users in team ${event.teamId}`);
    }
  }
}
exports.default = ApiKeyCleanupProcessor;
_defineProperty(ApiKeyCleanupProcessor, "applicableEvents", ["teams.update"]);