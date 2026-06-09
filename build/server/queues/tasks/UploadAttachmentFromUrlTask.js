"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("./../../context");
var _models = require("./../../models");
var _files = _interopRequireDefault(require("./../../storage/files"));
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A task that uploads the provided url to a known attachment.
 */
class UploadAttachmentFromUrlTask extends _BaseTask.default {
  async perform(props) {
    const attachment = await _models.Attachment.findByPk(props.attachmentId, {
      rejectOnEmpty: true,
      include: [{
        association: "user"
      }]
    });
    try {
      const res = await _files.default.storeFromUrl(props.url, attachment.key, attachment.acl);
      if (res?.url) {
        const ctx = (0, _context.createContext)({
          user: attachment.user
        });
        await attachment.updateWithCtx(ctx, {
          url: res.url,
          size: res.contentLength,
          contentType: res.contentType
        });
      }
    } catch (err) {
      return {
        error: err.message
      };
    }
    return {};
  }
  get options() {
    return {
      attempts: 3,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = UploadAttachmentFromUrlTask;