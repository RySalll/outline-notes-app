"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _jszip = _interopRequireDefault(require("jszip"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _env = _interopRequireDefault(require("./../../env"));
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _DocumentHelper = require("./../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("./../../models/helpers/ProsemirrorHelper");
var _presenters = require("./../../presenters");
var _ZipHelper = _interopRequireDefault(require("./../../utils/ZipHelper"));
var _fs = require("./../../utils/fs");
var _package = _interopRequireDefault(require("../../../package.json"));
var _ExportTask = _interopRequireDefault(require("./ExportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportJSONTask extends _ExportTask.default {
  async export(collections, fileOperation) {
    const zip = new _jszip.default();

    // serial to avoid overloading, slow and steady wins the race
    for (const collection of collections) {
      await this.addCollectionToArchive(zip, collection, fileOperation.options?.includeAttachments ?? true);
    }
    await this.addMetadataToArchive(zip, fileOperation);
    return _ZipHelper.default.toTmpFile(zip);
  }
  async addMetadataToArchive(zip, fileOperation) {
    const user = await fileOperation.$get("user");
    const metadata = {
      exportVersion: 1,
      version: _package.default.version,
      createdAt: new Date().toISOString(),
      createdById: fileOperation.userId,
      createdByEmail: user?.email ?? null
    };
    zip.file(`metadata.json`, _env.default.isDevelopment ? JSON.stringify(metadata, null, 2) : JSON.stringify(metadata));
  }
  async addCollectionToArchive(zip, collection, includeAttachments) {
    const output = {
      collection: {
        ...(0, _omit.default)(await (0, _presenters.presentCollection)(undefined, collection), ["url", "description"]),
        documentStructure: collection.documentStructure
      },
      documents: {},
      attachments: {}
    };
    async function addDocumentTree(nodes) {
      for (const node of nodes) {
        const document = await _models.Document.findByPk(node.id, {
          includeState: true
        });
        if (!document) {
          continue;
        }
        const attachments = includeAttachments ? await _models.Attachment.findAll({
          where: {
            teamId: document.teamId,
            id: _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document))
          }
        }) : [];
        await Promise.all(attachments.map(async attachment => {
          zip.file(attachment.key, new Promise(resolve => {
            attachment.buffer.then(resolve).catch(err => {
              _Logger.default.warn(`Failed to read attachment from storage`, {
                attachmentId: attachment.id,
                teamId: attachment.teamId,
                error: err.message
              });
              resolve(Buffer.from(""));
            });
          }), {
            date: attachment.updatedAt,
            createFolders: true
          });
          output.attachments[attachment.id] = {
            ...(0, _omit.default)((0, _presenters.presentAttachment)(attachment), "url"),
            key: attachment.key
          };
        }));
        output.documents[document.id] = {
          id: document.id,
          urlId: document.urlId,
          title: document.title,
          icon: document.icon,
          color: document.color,
          data: _DocumentHelper.DocumentHelper.toProsemirror(document),
          createdById: document.createdById,
          createdByName: document.createdBy.name,
          createdByEmail: document.createdBy.email,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
          publishedAt: document.publishedAt ? document.publishedAt.toISOString() : null,
          fullWidth: document.fullWidth,
          template: document.template,
          parentDocumentId: document.parentDocumentId
        };
        if (node.children?.length > 0) {
          await addDocumentTree(node.children);
        }
      }
    }
    if (collection.documentStructure) {
      await addDocumentTree(collection.documentStructure);
    }
    zip.file(`${(0, _fs.serializeFilename)(collection.name)}.json`, _env.default.isDevelopment ? JSON.stringify(output, null, 2) : JSON.stringify(output));
  }
}
exports.default = ExportJSONTask;