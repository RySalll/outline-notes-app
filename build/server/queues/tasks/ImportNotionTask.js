"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _compact = _interopRequireDefault(require("lodash/compact"));
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _uuid = require("uuid");
var _documentImporter = _interopRequireDefault(require("./../../commands/documentImporter"));
var _context = require("./../../context");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _ImportHelper = _interopRequireDefault(require("./../../utils/ImportHelper"));
var _ImportTask = _interopRequireDefault(require("./ImportTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class ImportNotionTask extends _ImportTask.default {
  constructor() {
    super(...arguments);
    /**
     * Regex to find markdown images of all types
     */
    _defineProperty(this, "ImageRegex", /!\[(?<alt>[^\][]*?)]\((?<filename>[^\][]*?)(?=“|\))“?(?<title>[^\][”]+)?”?\)/g);
    /**
     * Regex to find markdown links containing ID's that look like UUID's with the
     * "-"'s removed, Notion's externalId format.
     */
    _defineProperty(this, "NotionLinkRegex", /\[([^[]+)]\((.*?([0-9a-fA-F]{32})\..*?)\)/g);
    /**
     * Regex to find Notion document UUID's in the title of a document.
     */
    _defineProperty(this, "NotionUUIDRegex", /\s([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}|[0-9a-fA-F]{32})$/);
  }
  async parseData(dirPath, fileOperation) {
    const tree = await _ImportHelper.default.toFileTree(dirPath);
    if (!tree) {
      throw new Error("Could not find valid content in zip file");
    }

    // New Notion exports have a single folder with the name of the export, we must skip this
    // folder and go directly to the children.
    let parsed;
    if (tree.children.length === 1 && tree.children[0].children.find(child => child.title === "index")) {
      parsed = await this.parseFileTree(fileOperation, tree.children[0].children.filter(child => child.title !== "index"));
    } else {
      parsed = await this.parseFileTree(fileOperation, tree.children);
    }
    if (parsed.documents.length === 0 && parsed.collections.length === 1) {
      const collection = parsed.collections[0];
      const collectionId = (0, _uuid.v4)();
      if (collection.description) {
        parsed.documents.push({
          title: collection.name,
          icon: collection.icon,
          color: collection.color,
          path: "",
          text: String(collection.description),
          id: collection.id,
          externalId: collection.externalId,
          mimeType: "text/html",
          collectionId
        });
      }
      collection.name = "Notion";
      collection.icon = undefined;
      collection.color = undefined;
      collection.externalId = undefined;
      collection.description = undefined;
      collection.id = collectionId;
    }
    return parsed;
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
    const parseNodeChildren = async (children, collectionId, parentDocumentId) => {
      await Promise.all(children.map(async child => {
        // Ignore the CSV's for databases upfront
        if (child.path.endsWith(".csv")) {
          return;
        }
        const id = (0, _uuid.v4)();
        const match = child.title.match(this.NotionUUIDRegex);
        const name = child.title.replace(this.NotionUUIDRegex, "");
        const externalId = match ? match[0].trim() : undefined;

        // If it's not a text file we're going to treat it as an attachment.
        const mimeType = _mimeTypes.default.lookup(child.name);
        const isDocument = mimeType === "text/markdown" || mimeType === "text/plain" || mimeType === "text/html";

        // If it's not a document and not a folder, treat it as an attachment
        if (!isDocument && mimeType) {
          output.attachments.push({
            id,
            name: child.name,
            path: child.path,
            mimeType,
            buffer: () => _fsExtra.default.readFile(child.path),
            externalId
          });
          return;
        }
        _Logger.default.debug("task", `Processing ${name} as ${mimeType}`);
        const {
          title,
          icon,
          text
        } = await _database.sequelize.transaction(async transaction => (0, _documentImporter.default)({
          mimeType: mimeType || "text/markdown",
          fileName: name,
          content: child.children.length > 0 ? "" : await _fsExtra.default.readFile(child.path, "utf8"),
          user,
          ctx: (0, _context.createContext)({
            user,
            transaction
          })
        }));
        const existingDocumentIndex = output.documents.findIndex(doc => doc.externalId === externalId);
        const existingDocument = output.documents[existingDocumentIndex];

        // If there is an existing document with the same externalId that means
        // we've already parsed either a folder or a file referencing the same
        // document, as such we should merge.
        if (existingDocument) {
          if (existingDocument.text === "") {
            output.documents[existingDocumentIndex].text = text;
          }
          await parseNodeChildren(child.children, collectionId, existingDocument.id);
        } else {
          output.documents.push({
            id,
            title,
            icon,
            text,
            collectionId,
            parentDocumentId,
            path: child.path,
            mimeType: mimeType || "text/markdown",
            externalId
          });
          await parseNodeChildren(child.children, collectionId, id);
        }
      }));
    };
    const replaceInternalLinksAndImages = text => {
      // Find if there are any images in this document
      const imagesInText = this.parseImages(text);
      for (const image of imagesInText) {
        const name = _path.default.basename(image.src);
        const attachment = output.attachments.find(att => att.path.endsWith(image.src) || encodeURI(att.path).endsWith(image.src));
        if (!attachment) {
          if (!image.src.startsWith("http")) {
            _Logger.default.info("task", `Could not find referenced attachment with name ${name} and src ${image.src}`);
          }
        } else {
          text = text.replace(new RegExp((0, _escapeRegExp.default)(image.src), "g"), `<<${attachment.id}>>`);
        }
      }

      // With Notion's HTML import, images sometimes come wrapped in anchor tags
      // This isn't supported in Outline's editor, so we need to strip them.
      text = text.replace(/\[!\[([^[]+)]/g, "![]");

      // Find if there are any links in this document pointing to other documents
      const internalLinksInText = this.parseInternalLinks(text);

      // For each link update to the standardized format of <<documentId>>
      // instead of a relative or absolute URL within the original zip file.
      for (const link of internalLinksInText) {
        const doc = output.documents.find(doc => doc.externalId === link.externalId);
        if (!doc) {
          _Logger.default.info("task", `Could not find referenced document with externalId ${link.externalId}`);
        } else {
          text = text.replace(link.href, `<<${doc.id}>>`);
        }
      }
      return text;
    };

    // All nodes in the root level should become collections
    for (const node of tree) {
      const match = node.title.match(this.NotionUUIDRegex);
      const name = node.title.replace(this.NotionUUIDRegex, "");
      const externalId = match ? match[0].trim() : undefined;
      const mimeType = _mimeTypes.default.lookup(node.name);
      const existingCollectionIndex = output.collections.findIndex(collection => collection.externalId === externalId);
      const existingCollection = output.collections[existingCollectionIndex];
      const collectionId = existingCollection?.id || (0, _uuid.v4)();
      let description;

      // Root level docs become the descriptions of collections
      if (mimeType === "text/markdown" || mimeType === "text/plain" || mimeType === "text/html") {
        const {
          text
        } = await _database.sequelize.transaction(async transaction => (0, _documentImporter.default)({
          mimeType,
          fileName: name,
          content: await _fsExtra.default.readFile(node.path, "utf8"),
          user,
          ctx: (0, _context.createContext)({
            user,
            transaction
          })
        }));
        description = text;
      } else if (node.children.length > 0) {
        await parseNodeChildren(node.children, collectionId);
      } else {
        _Logger.default.debug("task", `Unhandled file in zip: ${node.path}`, {
          fileOperationId: fileOperation.id
        });
        continue;
      }
      if (existingCollectionIndex !== -1) {
        if (description) {
          output.collections[existingCollectionIndex].description = description;
        }
      } else {
        output.collections.push({
          id: collectionId,
          name,
          description,
          externalId
        });
      }
    }
    for (const document of output.documents) {
      document.text = replaceInternalLinksAndImages(document.text);
    }
    for (const collection of output.collections) {
      if (typeof collection.description === "string") {
        collection.description = replaceInternalLinksAndImages(collection.description);
      }
    }
    return output;
  }

  /**
   * Extracts internal links from a markdown document, taking into account the
   * externalId of the document, which is part of the link title.
   *
   * @param text The markdown text to parse
   * @returns An array of internal links
   */
  parseInternalLinks(text) {
    return (0, _compact.default)([...text.matchAll(this.NotionLinkRegex)].map(match => ({
      title: match[1],
      href: match[2],
      externalId: match[3]
    })));
  }

  /**
   * Extracts images from the markdown document
   *
   * @param text The markdown text to parse
   * @returns An array of internal links
   */
  parseImages(text) {
    return (0, _compact.default)([...text.matchAll(this.ImageRegex)].map(match => ({
      alt: match[1],
      src: match[2]
    })));
  }
}
exports.default = ImportNotionTask;