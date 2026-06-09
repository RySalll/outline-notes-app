"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _find = _interopRequireDefault(require("lodash/find"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _prosemirrorModel = require("prosemirror-model");
var _uuid = require("uuid");
var _editor = require("./../../editor");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _ImportHelper = _interopRequireDefault(require("./../../utils/ImportHelper"));
var _ImportTask = _interopRequireDefault(require("./ImportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ImportJSONTask extends _ImportTask.default {
  async parseData(dirPath, _) {
    const tree = await _ImportHelper.default.toFileTree(dirPath);
    if (!tree) {
      throw new Error("Could not find valid content in zip file");
    }
    return this.parseFileTree(tree.children);
  }

  /**
   * Converts the file structure from zipAsFileTree into documents,
   * collections, and attachments.
   *
   * @param tree An array of FileTreeNode representing root files in the zip
   * @returns A StructuredImportData object
   */
  async parseFileTree(tree) {
    let rootPath = "";
    const output = {
      collections: [],
      documents: [],
      attachments: []
    };

    // Load metadata
    let metadata = undefined;
    for (const node of tree) {
      if (!rootPath) {
        rootPath = _path.default.dirname(node.path);
      }
      if (node.path === "metadata.json") {
        try {
          metadata = JSON.parse(await _fsExtra.default.readFile(node.path, "utf8"));
        } catch (err) {
          throw new Error(`Could not parse metadata.json. ${err.message}`);
        }
      }
    }
    if (!rootPath) {
      throw new Error("Could not find root path");
    }
    _Logger.default.debug("task", "Importing JSON metadata", {
      metadata
    });
    function mapDocuments(documents, collectionId) {
      Object.values(documents).forEach(node => {
        const id = (0, _uuid.v4)();
        output.documents.push({
          ...node,
          path: "",
          // populate text to maintain consistency with existing data.
          // moving forward, `data` field will be used.
          text: _editor.serializer.serialize(_prosemirrorModel.Node.fromJSON(_editor.schema, node.data)),
          data: node.data,
          icon: node.icon ?? node.emoji,
          color: node.color,
          createdAt: node.createdAt ? new Date(node.createdAt) : undefined,
          updatedAt: node.updatedAt ? new Date(node.updatedAt) : undefined,
          publishedAt: node.publishedAt ? new Date(node.publishedAt) : null,
          collectionId,
          externalId: node.id,
          mimeType: "application/json",
          parentDocumentId: node.parentDocumentId ? (0, _find.default)(output.documents, d => d.externalId === node.parentDocumentId)?.id : null,
          id
        });
      });
    }
    async function mapAttachments(attachments) {
      Object.values(attachments).forEach(node => {
        const id = (0, _uuid.v4)();
        const mimeType = _mimeTypes.default.lookup(node.key) || "application/octet-stream";
        output.attachments.push({
          id,
          name: node.name,
          buffer: () => _fsExtra.default.readFile(_path.default.join(rootPath, node.key)),
          mimeType,
          path: node.key,
          externalId: node.id
        });
      });
    }

    // All nodes in the root level should be collections as JSON + metadata
    for (const node of tree) {
      if (node.children.length > 0 || node.path.endsWith("metadata.json")) {
        continue;
      }
      let item;
      try {
        item = JSON.parse(await _fsExtra.default.readFile(node.path, "utf8"));
      } catch (err) {
        throw new Error(`Could not parse ${node.path}. ${err.message}`);
      }
      const collectionId = (0, _uuid.v4)();
      const data = item.collection.description ?? item.collection.data;
      output.collections.push({
        ...item.collection,
        description: data && typeof data === "object" ? _editor.serializer.serialize(_prosemirrorModel.Node.fromJSON(_editor.schema, data)) : data,
        id: collectionId,
        externalId: item.collection.id
      });
      if (Object.values(item.documents).length) {
        mapDocuments(item.documents, collectionId);
      }
      if (Object.values(item.attachments).length) {
        await mapAttachments(item.attachments);
      }
    }

    // Check all of the attachments we've created against urls and
    // replace them with the correct redirect urls before continuing.
    if (output.attachments.length) {
      this.replaceAttachmentURLs(output);
    }
    return output;
  }
  replaceAttachmentURLs(output) {
    const attachmentTypes = ["attachment", "image", "video"];
    const urlRegex = /\/api\/attachments.redirect\?id=(.+)/;
    const attachmentExternalIdMap = output.attachments.reduce((obj, attachment) => {
      if (attachment.externalId) {
        obj[attachment.externalId] = attachment;
      }
      return obj;
    }, {});
    const getRedirectPath = existingPath => {
      if (!existingPath) {
        return;
      }
      const match = existingPath.match(urlRegex);
      if (!match) {
        return existingPath;
      }
      const attachment = attachmentExternalIdMap[match[1]];
      // maintain the existing behaviour of using existingPath when attachment id is not present.
      return attachment ? _models.Attachment.getRedirectUrl(attachment.id) : existingPath;
    };
    const transformAttachmentNode = node => {
      const json = node.toJSON();
      const attrs = json.attrs ?? {};
      if (node.type.name === "attachment") {
        // attachment node uses 'href' attribute
        attrs.href = getRedirectPath(attrs.href);
      } else if (node.type.name === "image" || node.type.name === "video") {
        // image & video nodes use 'src' attribute
        attrs.src = getRedirectPath(attrs.src);
      }
      json.attrs = attrs;
      return _prosemirrorModel.Node.fromJSON(_editor.schema, json);
    };
    const transformFragment = fragment => {
      const nodes = [];
      fragment.forEach(node => {
        nodes.push(attachmentTypes.includes(node.type.name) ? transformAttachmentNode(node) : node.copy(transformFragment(node.content)));
      });
      return _prosemirrorModel.Fragment.fromArray(nodes);
    };
    for (const document of output.documents) {
      const node = _prosemirrorModel.Node.fromJSON(_editor.schema, document.data);
      const transformedNode = node.copy(transformFragment(node.content));
      document.data = transformedNode;
      document.text = _editor.serializer.serialize(transformedNode);
    }
  }
}
exports.default = ImportJSONTask;