"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _truncate = _interopRequireDefault(require("lodash/truncate"));
var _types = require("./../../../shared/types");
var _files = require("./../../../shared/utils/files");
var _ExportFailureEmail = _interopRequireDefault(require("./../../emails/templates/ExportFailureEmail"));
var _ExportSuccessEmail = _interopRequireDefault(require("./../../emails/templates/ExportSuccessEmail"));
var _env = _interopRequireDefault(require("./../../env"));
var _errors = require("./../../errors");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _fileOperation = _interopRequireDefault(require("./../../presenters/fileOperation"));
var _files2 = _interopRequireDefault(require("./../../storage/files"));
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportTask extends _BaseTask.default {
  /**
   * Transforms the data to be exported, uploads, and notifies user.
   *
   * @param props The props
   */
  async perform(_ref) {
    let {
      fileOperationId
    } = _ref;
    _Logger.default.info("task", `ExportTask fetching data for ${fileOperationId}`);
    const fileOperation = await _models.FileOperation.findByPk(fileOperationId, {
      rejectOnEmpty: true
    });
    const [team, user] = await Promise.all([_models.Team.findByPk(fileOperation.teamId, {
      rejectOnEmpty: true
    }), _models.User.findByPk(fileOperation.userId, {
      rejectOnEmpty: true
    })]);
    const collectionIds = fileOperation.collectionId ? [fileOperation.collectionId] : await user.collectionIds();
    const collections = await _models.Collection.findAll({
      where: {
        id: collectionIds
      }
    });
    let filePath;
    try {
      if (!fileOperation.collectionId) {
        const totalAttachmentsSize = await _models.Attachment.getTotalSizeForTeam(user.teamId);
        if (fileOperation.options?.includeAttachments && _env.default.MAXIMUM_EXPORT_SIZE && totalAttachmentsSize > _env.default.MAXIMUM_EXPORT_SIZE) {
          throw (0, _errors.ValidationError)(`${(0, _files.bytesToHumanReadable)(totalAttachmentsSize)} of attachments in workspace is larger than maximum export size of ${(0, _files.bytesToHumanReadable)(_env.default.MAXIMUM_EXPORT_SIZE)}.`);
        }
      }
      _Logger.default.info("task", `ExportTask processing data for ${fileOperationId}`, {
        options: fileOperation.options
      });
      await this.updateFileOperation(fileOperation, {
        state: _types.FileOperationState.Creating
      });
      filePath = await this.export(collections, fileOperation);
      _Logger.default.info("task", `ExportTask uploading data for ${fileOperationId}`);
      await this.updateFileOperation(fileOperation, {
        state: _types.FileOperationState.Uploading
      });
      const stat = await _fsExtra.default.stat(filePath);
      const url = await _files2.default.store({
        body: _fsExtra.default.createReadStream(filePath),
        contentLength: stat.size,
        contentType: "application/zip",
        key: fileOperation.key,
        acl: "private"
      });
      await this.updateFileOperation(fileOperation, {
        size: stat.size,
        state: _types.FileOperationState.Complete,
        url
      });
      if (user.subscribedToEventType(_types.NotificationEventType.ExportCompleted)) {
        await new _ExportSuccessEmail.default({
          to: user.email,
          userId: user.id,
          id: fileOperation.id,
          teamUrl: team.url,
          teamId: team.id
        }).schedule();
      }
    } catch (error) {
      await this.updateFileOperation(fileOperation, {
        state: _types.FileOperationState.Error,
        error
      });
      if (user.subscribedToEventType(_types.NotificationEventType.ExportCompleted)) {
        await new _ExportFailureEmail.default({
          to: user.email,
          userId: user.id,
          teamUrl: team.url,
          teamId: team.id
        }).schedule();
      }
      throw error;
    } finally {
      if (filePath) {
        void _fsExtra.default.unlink(filePath).catch(error => {
          _Logger.default.error(`Failed to delete temporary file ${filePath}`, error);
        });
      }
    }
  }

  /**
   * Transform the data in all of the passed collections into a single Buffer.
   *
   * @param collections The collections to export
   * @returns A promise that resolves to a temporary file path
   */

  /**
   * Update the state of the underlying FileOperation in the database and send
   * an event to the client.
   *
   * @param fileOperation The FileOperation to update
   */
  async updateFileOperation(fileOperation, options) {
    await fileOperation.update({
      ...options,
      error: options.error ? (0, _truncate.default)(options.error.message, {
        length: 255
      }) : undefined
    }, {
      hooks: false
    });
    await _models.Event.schedule({
      name: "fileOperations.update",
      modelId: fileOperation.id,
      teamId: fileOperation.teamId,
      actorId: fileOperation.userId,
      data: (0, _fileOperation.default)(fileOperation)
    });
  }

  /**
   * Job options such as priority and retry strategy, as defined by Bull.
   */
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background,
      attempts: 1
    };
  }
}
exports.default = ExportTask;