"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _uuid = require("uuid");
var _models = require("./../../models");
var _AttachmentHelper = require("./../../models/helpers/AttachmentHelper");
var _files = _interopRequireDefault(require("./../../storage/files"));
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A task that uploads the provided avatarUrl to S3 storage and updates the
 * team's record with the new url.
 */
class UploadTeamAvatarTask extends _BaseTask.default {
  async perform(props) {
    const team = await _models.Team.findByPk(props.teamId, {
      rejectOnEmpty: true
    });
    const res = await _files.default.storeFromUrl(props.avatarUrl, `${_AttachmentHelper.Buckets.avatars}/${team.id}/${(0, _uuid.v4)()}`, "public-read");
    if (res?.url) {
      await team.update({
        avatarUrl: res.url
      });
    }
  }
  get options() {
    return {
      attempts: 3,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = UploadTeamAvatarTask;