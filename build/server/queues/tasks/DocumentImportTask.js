"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _documentCreator = _interopRequireDefault(require("./../../commands/documentCreator"));
var _documentImporter = _interopRequireDefault(require("./../../commands/documentImporter"));
var _context = require("./../../context");
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _files = _interopRequireDefault(require("./../../storage/files"));
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentImportTask extends _BaseTask.default {
  async perform(_ref) {
    let {
      key,
      sourceMetadata,
      ip,
      publish,
      collectionId,
      parentDocumentId,
      userId
    } = _ref;
    try {
      const content = await _files.default.getFileBuffer(key);
      const document = await _database.sequelize.transaction(async transaction => {
        const user = await _models.User.findByPk(userId, {
          rejectOnEmpty: true,
          transaction
        });
        const {
          text,
          state,
          title,
          icon
        } = await (0, _documentImporter.default)({
          user,
          fileName: sourceMetadata.fileName,
          mimeType: sourceMetadata.mimeType,
          content,
          ctx: (0, _context.createContext)({
            user,
            transaction,
            ip
          })
        });
        return (0, _documentCreator.default)({
          sourceMetadata,
          title,
          icon,
          text,
          state,
          publish,
          collectionId,
          parentDocumentId,
          user,
          ctx: (0, _context.createContext)({
            user,
            transaction,
            ip
          })
        });
      });
      return {
        documentId: document.id
      };
    } catch (err) {
      return {
        error: err.message
      };
    } finally {
      await _files.default.deleteFile(key);
    }
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = DocumentImportTask;