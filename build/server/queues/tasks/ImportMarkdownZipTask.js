"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _uuid = require("uuid");
var _documentImporter = _interopRequireDefault(require("./../../commands/documentImporter"));
var _context = require("./../../context");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _AttachmentHelper = require("./../../models/helpers/AttachmentHelper");
var _database = require("./../../storage/database");
var _ImportHelper = _interopRequireDefault(require("./../../utils/ImportHelper"));
var _ImportTask = _interopRequireDefault(require("./ImportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ImportMarkdownZipTask extends _ImportTask.default {
  async parseData(dirPath, fileOperation) {
    const tree = await _ImportHelper.default.toFileTree(dirPath);
    if (!tree) {
      throw new Error("Could not find valid content in zip file");
    }
    return this.parseFileTree(fileOperation, tree.children);
  }

  /**
   * Converts the file structure from zipAsFileTree into documents,
   * collections, and attachments.
   *
   * @param fileOperation The file operation
   * @param tree An array of FileTreeNode representing root files in the zip
   * @returns A StructuredImportData object
   */
  async parseFileTree(fileOperation, tree) {
    const user = await _models.User.findByPk(fileOperation.userId, {
      rejectOnEmpty: true
    });
    const output = {
      collections: [],
      documents: [],
      attachments: []
    };
    const docPathToIdMap = new Map();
    async function parseNodeChildren(children, collectionId, parentDocumentId) {
      await Promise.all(children.map(async child => {
        // special case for folders of attachments
        if (child.name === _AttachmentHelper.Buckets.uploads || child.name === _AttachmentHelper.Buckets.public || child.children.length > 0 && (child.path.includes(`/${_AttachmentHelper.Buckets.public}/`) || child.path.includes(`/${_AttachmentHelper.Buckets.uploads}/`))) {
          return parseNodeChildren(child.children, collectionId);
        }
        const id = (0, _uuid.v4)();

        // this is an attachment
        if (child.children.length === 0 && (child.path.includes(`/${_AttachmentHelper.Buckets.uploads}/`) || child.path.includes(`/${_AttachmentHelper.Buckets.public}/`))) {
          output.attachments.push({
            id,
            name: child.name,
            path: child.path,
            mimeType: _mimeTypes.default.lookup(child.path) || "application/octet-stream",
            buffer: () => _fsExtra.default.readFile(child.path)
          });
          return;
        }
        const {
          title,
          icon,
          text
        } = await _database.sequelize.transaction(async transaction => (0, _documentImporter.default)({
          mimeType: "text/markdown",
          fileName: child.name,
          content: child.children.length > 0 ? "" : await _fsExtra.default.readFile(child.path, "utf8"),
          user,
          ctx: (0, _context.createContext)({
            user,
            transaction
          })
        }));
        const existingDocumentIndex = output.documents.findIndex(doc => doc.title === title && doc.collectionId === collectionId && doc.parentDocumentId === parentDocumentId);
        const existingDocument = output.documents[existingDocumentIndex];

        // When there is a file and a folder with the same name this handles
        // the case by combining the two into one document with nested children
        if (existingDocument) {
          docPathToIdMap.set(child.path, existingDocument.id);
          if (existingDocument.text === "") {
            output.documents[existingDocumentIndex].text = text;
          }
          await parseNodeChildren(child.children, collectionId, existingDocument.id);
        } else {
          docPathToIdMap.set(child.path, id);
          output.documents.push({
            id,
            title,
            icon,
            text,
            collectionId,
            parentDocumentId,
            path: child.path,
            mimeType: "text/markdown"
          });
          await parseNodeChildren(child.children, collectionId, id);
        }
      }));
    }

    // All nodes in the root level should be collections
    for (const node of tree) {
      if (node.children.length > 0) {
        const collectionId = (0, _uuid.v4)();
        output.collections.push({
          id: collectionId,
          name: node.title
        });
        await parseNodeChildren(node.children, collectionId);
      } else {
        _Logger.default.debug("task", `Unhandled file in zip: ${node.path}`, {
          fileOperationId: fileOperation.id
        });
      }
    }
    for (const document of output.documents) {
      // Check all of the attachments we've created against urls in the text
      // and replace them out with attachment redirect urls before continuing.
      for (const attachment of output.attachments) {
        const encodedPath = encodeURI(attachment.path);

        // Pull the collection and subdirectory out of the path name, upload
        // folders in an export are relative to the document itself
        const normalizedAttachmentPath = encodedPath.replace(new RegExp(`(.*)/${_AttachmentHelper.Buckets.uploads}/`), `${_AttachmentHelper.Buckets.uploads}/`).replace(new RegExp(`(.*)/${_AttachmentHelper.Buckets.public}/`), `${_AttachmentHelper.Buckets.public}/`);
        const reference = `<<${attachment.id}>>`;
        document.text = document.text.replace(new RegExp((0, _escapeRegExp.default)(encodedPath), "g"), reference).replace(new RegExp(`\.?/?${(0, _escapeRegExp.default)(normalizedAttachmentPath)}`, "g"), reference);
      }
      const basePath = _path.default.dirname(document.path);

      // check internal document links in the text and replace them with placeholders.
      // When persisting, the placeholders will be replaced with the right urls.
      const internalLinks = [...document.text.matchAll(/\[[^\]]+\]\(([^)]+\.md)\)/g)];
      internalLinks.forEach(match => {
        const referredDocPath = match[1];
        const normalizedDocPath = decodeURI(_path.default.normalize(`${basePath}/${referredDocPath}`));
        const referredDocId = docPathToIdMap.get(normalizedDocPath);
        if (referredDocId) {
          document.text = document.text.replace(referredDocPath, `<<${referredDocId}>>`);
        }
      });
    }
    return output;
  }
}
exports.default = ImportMarkdownZipTask;