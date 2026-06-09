"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _chunk = _interopRequireDefault(require("lodash/chunk"));
var _truncate = _interopRequireDefault(require("lodash/truncate"));
var _tmp = _interopRequireDefault(require("tmp"));
var _types = require("./../../../shared/types");
var _validations = require("./../../../shared/validations");
var _attachmentCreator = _interopRequireDefault(require("./../../commands/attachmentCreator"));
var _documentCreator = _interopRequireDefault(require("./../../commands/documentCreator"));
var _context = require("./../../context");
var _editor = require("./../../editor");
var _errors = require("./../../errors");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _ZipHelper = _interopRequireDefault(require("./../../utils/ZipHelper"));
var _url = require("./../../utils/url");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Standardized format for data importing, to be used by all import tasks.
 */

class ImportTask extends _BaseTask.default {
  /**
   * Runs the import task.
   *
   * @param props The props
   */
  async perform(_ref) {
    let {
      fileOperationId
    } = _ref;
    let dirPath;
    const fileOperation = await _models.FileOperation.findByPk(fileOperationId, {
      rejectOnEmpty: true
    });
    try {
      _Logger.default.info("task", `ImportTask fetching data for ${fileOperationId}`);
      dirPath = await this.fetchAndExtractData(fileOperation);
      if (!dirPath) {
        throw (0, _errors.InternalError)("Failed to fetch data for import from storage.");
      }
      _Logger.default.info("task", `ImportTask parsing data for ${fileOperationId}`, {
        dirPath
      });
      const parsed = await this.parseData(dirPath, fileOperation);
      if (parsed.collections.length === 0) {
        throw (0, _errors.ValidationError)("Uploaded file does not contain any valid collections. It may be corrupt, the wrong type, or version.");
      }
      if (parsed.documents.length === 0) {
        throw (0, _errors.ValidationError)("Uploaded file does not contain any valid documents");
      }
      let result;
      try {
        _Logger.default.info("task", `ImportTask persisting data for ${fileOperationId}`);
        result = await this.persistData(parsed, fileOperation);
      } catch (error) {
        _Logger.default.error(`ImportTask failed to persist data for ${fileOperationId}`, error);
        throw new Error("Sorry, an internal error occurred during import");
      }
      await this.updateFileOperation(fileOperation, _types.FileOperationState.Complete);
      return result;
    } catch (error) {
      await this.updateFileOperation(fileOperation, _types.FileOperationState.Error, error);
      throw error;
    } finally {
      if (dirPath) {
        await this.cleanupExtractedData(dirPath, fileOperation);
      }
    }
  }

  /**
   * Update the state of the underlying FileOperation in the database and send
   * an event to the client.
   *
   * @param fileOperation The FileOperation to update
   */
  async updateFileOperation(fileOperation, state, error) {
    await fileOperation.update({
      state,
      error: error ? (0, _truncate.default)(error.message, {
        length: 255
      }) : undefined
    }, {
      hooks: false
    });
    await _models.Event.schedule({
      name: "fileOperations.update",
      modelId: fileOperation.id,
      teamId: fileOperation.teamId,
      actorId: fileOperation.userId
    });
  }

  /**
   * Fetch the remote data associated with the file operation into a temporary disk location.
   *
   * @param fileOperation The FileOperation to fetch data for
   * @returns A promise that resolves to the temporary file path.
   */
  async fetchAndExtractData(fileOperation) {
    let cleanup;
    let filePath;
    try {
      const res = await fileOperation.handle;
      filePath = res.path;
      cleanup = res.cleanup;
      const path = await new Promise((resolve, reject) => {
        _tmp.default.dir((err, tmpDir) => {
          if (err) {
            _Logger.default.error("Could not create temporary directory", err);
            return reject(err);
          }
          _Logger.default.debug("task", `ImportTask extracting data for ${fileOperation.id}`);
          void _ZipHelper.default.extract(filePath, tmpDir).then(() => resolve(tmpDir)).catch(zErr => {
            _Logger.default.error("Could not extract zip file", zErr);
            reject(zErr);
          });
        });
      });
      return path;
    } finally {
      _Logger.default.debug("task", `ImportTask cleaning up temporary data for ${fileOperation.id}`);
      await cleanup?.();
    }
  }

  /**
   * Cleanup the temporary directory where the data was fetched and extracted.
   *
   * @param dirPath The temporary directory path where the data was fetched
   * @param fileOperation The associated FileOperation
   */
  async cleanupExtractedData(dirPath, fileOperation) {
    try {
      await _fsExtra.default.rm(dirPath, {
        recursive: true,
        force: true
      });
    } catch (error) {
      _Logger.default.error(`ImportTask failed to cleanup extracted data for ${fileOperation.id}`, error);
    }
  }

  /**
   * Parse the data loaded from fetchAndExtractData into a consistent structured format
   * that represents collections, documents, and the relationships between them.
   *
   * @param dirPath The temporary directory path where the data was fetched
   * @param fileOperation The FileOperation to parse data for
   * @returns A promise that resolves to the structured data
   */

  /**
   * Persist the data that was already fetched and parsed into the consistent
   * structured data.
   *
   * @param props The props
   */
  async persistData(data, fileOperation) {
    const collections = new Map();
    const documents = new Map();
    const attachments = new Map();
    const user = await _models.User.findByPk(fileOperation.userId, {
      rejectOnEmpty: true
    });
    const ip = user.lastActiveIp || undefined;
    try {
      await this.preprocessDocUrlIds(data);

      // Collections
      for (const item of data.collections) {
        await _database.sequelize.transaction(async transaction => {
          _Logger.default.debug("task", `ImportTask persisting collection ${item.name} (${item.id})`);
          let description = item.description;

          // Description can be markdown text or a Prosemirror object if coming
          // from JSON format. In that case we need to serialize to Markdown.
          if (description instanceof Object) {
            description = _editor.serializer.serialize(description);
          }
          if (description) {
            // Check all of the attachments we've created against urls in the text
            // and replace them out with attachment redirect urls before saving.
            for (const aitem of data.attachments) {
              description = description.replace(new RegExp(`<<${aitem.id}>>`, "g"), _models.Attachment.getRedirectUrl(aitem.id));
            }

            // Check all of the document we've created against urls in the text
            // and replace them out with a valid internal link.
            for (const ditem of data.documents) {
              description = description.replace(new RegExp(`<<${ditem.id}>>`, "g"), _models.Document.getPath({
                title: ditem.title,
                urlId: ditem.urlId
              }));
            }
          }
          const options = {};
          if (item.urlId) {
            const existing = await _models.Collection.unscoped().findOne({
              attributes: ["id"],
              paranoid: false,
              transaction,
              where: {
                urlId: item.urlId
              }
            });
            if (!existing) {
              options.urlId = item.urlId;
            }
          }
          const truncatedDescription = description ? (0, _truncate.default)(description, {
            length: _validations.CollectionValidation.maxDescriptionLength
          }) : null;
          const sharedDefaults = {
            ...options,
            id: item.id,
            description: truncatedDescription,
            color: item.color,
            icon: item.icon,
            sort: item.sort,
            createdById: fileOperation.userId,
            permission: item.permission ?? fileOperation.options?.permission !== undefined ? fileOperation.options?.permission : _types.CollectionPermission.ReadWrite,
            importId: fileOperation.id
          };

          // check if collection with name exists
          const response = await _models.Collection.findOrCreate({
            where: {
              teamId: fileOperation.teamId,
              name: item.name
            },
            defaults: sharedDefaults,
            transaction
          });
          let collection = response[0];
          const isCreated = response[1];

          // create new collection if name already exists, yes it's possible that
          // there is also a "Name (Imported)" but this is a case not worth dealing
          // with right now
          if (!isCreated) {
            const name = `${item.name} (Imported)`;
            collection = await _models.Collection.create({
              ...sharedDefaults,
              name,
              teamId: fileOperation.teamId
            }, {
              transaction
            });
          }
          await _models.Event.create({
            name: "collections.create",
            collectionId: collection.id,
            teamId: collection.teamId,
            actorId: fileOperation.userId,
            data: {
              name: collection.name
            },
            ip
          }, {
            transaction
          });
          collections.set(item.id, collection);

          // Documents
          for (const item of data.documents.filter(d => d.collectionId === collection.id)) {
            _Logger.default.debug("task", `ImportTask persisting document ${item.title} (${item.id})`);
            let text = item.text;

            // Check all of the attachments we've created against urls in the text
            // and replace them out with attachment redirect urls before saving.
            for (const aitem of data.attachments) {
              text = text.replace(new RegExp(`<<${aitem.id}>>`, "g"), _models.Attachment.getRedirectUrl(aitem.id));
            }

            // Check all of the document we've created against urls in the text
            // and replace them out with a valid internal link.
            for (const ditem of data.documents) {
              text = text.replace(new RegExp(`<<${ditem.id}>>`, "g"), _models.Document.getPath({
                title: ditem.title,
                urlId: ditem.urlId
              }));
            }
            const document = await (0, _documentCreator.default)({
              sourceMetadata: {
                fileName: _path.default.basename(item.path),
                mimeType: item.mimeType,
                externalId: item.externalId,
                createdByName: item.createdByName
              },
              id: item.id,
              title: item.title,
              urlId: item.urlId,
              text,
              content: item.data ? item.data : undefined,
              collectionId: item.collectionId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt ?? item.createdAt,
              publishedAt: item.updatedAt ?? item.createdAt ?? new Date(),
              parentDocumentId: item.parentDocumentId,
              importId: fileOperation.id,
              user,
              ctx: (0, _context.createContext)({
                user,
                transaction
              })
            });
            documents.set(item.id, document);
            await collection.addDocumentToStructure(document, 0, {
              transaction,
              save: false
            });
          }
          await collection.save({
            transaction
          });
        });
      }

      // Attachments
      await _database.sequelize.transaction(async transaction => {
        const chunks = (0, _chunk.default)(data.attachments, 10);
        for (const chunk of chunks) {
          // Parallelize 10 uploads at a time
          await Promise.all(chunk.map(async item => {
            _Logger.default.debug("task", `ImportTask persisting attachment ${item.name} (${item.id})`);
            const attachment = await (0, _attachmentCreator.default)({
              source: "import",
              preset: _types.AttachmentPreset.DocumentAttachment,
              id: item.id,
              name: item.name,
              type: item.mimeType,
              buffer: await item.buffer(),
              user,
              ctx: (0, _context.createContext)({
                user,
                transaction
              })
            });
            if (attachment) {
              attachments.set(item.id, attachment);
            }
          }));
        }
      });
    } catch (err) {
      _Logger.default.info("task", `Removing ${attachments.size} attachments on failure`);
      await Promise.all(Array.from(attachments.values()).map(model => _models.Attachment.deleteAttachmentFromS3(model)));
      throw err;
    }

    // Return value is only used for testing
    return {
      collections,
      documents,
      attachments
    };
  }

  /**
   * Job options such as priority and retry strategy, as defined by Bull.
   */
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Low,
      attempts: 1
    };
  }
  async preprocessDocUrlIds(data) {
    for (const doc of data.documents) {
      // check DB only if urlId is present in the input.
      if (doc.urlId) {
        const existing = await _models.Document.unscoped().findOne({
          attributes: ["id"],
          paranoid: false,
          where: {
            urlId: doc.urlId
          }
        });
        if (!existing) {
          continue;
        }
      }
      doc.urlId = (0, _url.generateUrlId)();
    }
  }
}
exports.default = ImportTask;