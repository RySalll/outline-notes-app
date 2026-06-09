"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _types = require("./../../../shared/types");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _Attachment = _interopRequireDefault(require("./../../models/Attachment"));
var _Document = _interopRequireDefault(require("./../../models/Document"));
var _DocumentHelper = require("./../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("./../../models/helpers/ProsemirrorHelper");
var _ZipHelper = _interopRequireDefault(require("./../../utils/ZipHelper"));
var _fs = require("./../../utils/fs");
var _ExportTask = _interopRequireDefault(require("./ExportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportDocumentTreeTask extends _ExportTask.default {
  /**
   * Exports the document tree to the given zip instance.
   *
   * @param zip The JSZip instance to add files to
   * @param documentId The document ID to export
   * @param pathInZip The path in the zip to add the document to
   * @param format The format to export in
   */
  async addDocumentToArchive(_ref) {
    let {
      zip,
      pathInZip,
      documentId,
      format = _types.FileOperationFormat.MarkdownZip,
      includeAttachments,
      pathMap
    } = _ref;
    _Logger.default.debug("task", `Adding document to archive`, {
      documentId
    });
    const document = await _Document.default.findByPk(documentId);
    if (!document) {
      return;
    }
    let text = format === _types.FileOperationFormat.HTMLZip ? await _DocumentHelper.DocumentHelper.toHTML(document, {
      centered: true
    }) : _DocumentHelper.DocumentHelper.toMarkdown(document);
    const attachmentIds = includeAttachments ? _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document)) : [];
    const attachments = attachmentIds.length ? await _Attachment.default.findAll({
      where: {
        teamId: document.teamId,
        id: attachmentIds
      }
    }) : [];

    // Add any referenced attachments to the zip file and replace the
    // reference in the document with the path to the attachment in the zip
    await Promise.all(attachments.map(async attachment => {
      _Logger.default.debug("task", `Adding attachment to archive`, {
        documentId,
        key: attachment.key
      });
      const dir = _path.default.dirname(pathInZip);
      zip.file(_path.default.join(dir, attachment.key), new Promise(resolve => {
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
      text = text.replace(new RegExp((0, _escapeRegExp.default)(attachment.redirectUrl), "g"), encodeURI(attachment.key));
    }));

    // Replace any internal links with relative paths to the document in the zip
    const internalLinks = [...text.matchAll(/\/doc\/(?:[0-9a-zA-Z-_~]*-)?([a-zA-Z0-9]{10,15})/g)];
    internalLinks.forEach(match => {
      const matchedLink = match[0];
      const matchedDocPath = pathMap.get(matchedLink);
      if (matchedDocPath) {
        const relativePath = _path.default.relative(pathInZip, matchedDocPath);
        if (relativePath.startsWith(".")) {
          text = text.replace(matchedLink, encodeURI(relativePath.substring(1)));
        }
      }
    });

    // Finally, add the document to the zip file
    zip.file(pathInZip, text, {
      date: document.updatedAt,
      createFolders: true,
      comment: JSON.stringify({
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      })
    });
  }

  /**
   * Exports the documents and attachments in the given collections to a zip file
   * and returns the path to the zip file in tmp.
   *
   * @param zip The JSZip instance to add files to
   * @param collections The collections to export
   * @param format The format to export in
   * @param includeAttachments Whether to include attachments in the export
   *
   * @returns The path to the zip file in tmp.
   */
  async addCollectionsToArchive(zip, collections, format) {
    let includeAttachments = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    const pathMap = this.createPathMap(collections, format);
    _Logger.default.debug("task", `Start adding ${Object.values(pathMap).length} documents to archive`);
    for (const path of pathMap) {
      const documentId = path[0].replace("/doc/", "");
      const pathInZip = path[1];
      await this.addDocumentToArchive({
        zip,
        pathInZip,
        documentId,
        includeAttachments,
        format,
        pathMap
      });
    }
    _Logger.default.debug("task", "Completed adding documents to archive");
    return await _ZipHelper.default.toTmpFile(zip);
  }

  /**
   * Generates a map of document urls to their path in the zip file.
   *
   * @param collections
   */
  createPathMap(collections, format) {
    const map = new Map();
    for (const collection of collections) {
      if (collection.documentStructure) {
        this.addDocumentTreeToPathMap(map, collection.documentStructure, (0, _fs.serializeFilename)(collection.name), format);
      }
    }
    return map;
  }
  addDocumentTreeToPathMap(map, nodes, root, format) {
    for (const node of nodes) {
      const title = (0, _fs.serializeFilename)(node.title) || "Untitled";
      const extension = format === _types.FileOperationFormat.HTMLZip ? "html" : "md";

      // Ensure the document is given a unique path in zip, even if it has
      // the same title as another document in the same collection.
      let i = 0;
      let filePath = _path.default.join(root, `${title}.${extension}`);
      while (Array.from(map.values()).includes(filePath)) {
        filePath = _path.default.join(root, `${title} (${++i}).${extension}`);
      }
      map.set(node.url, filePath);

      // If this is an imported document, the references to this doc are in the 'doc/{docId}' format.
      // Set this format to replace them with relative URLs in the zip.
      map.set(`/doc/${node.id}`, filePath);
      if (node.children?.length) {
        this.addDocumentTreeToPathMap(map, node.children, _path.default.join(root, title), format);
      }
    }
  }
}
exports.default = ExportDocumentTreeTask;