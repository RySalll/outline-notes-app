"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DocumentHelper = void 0;
var _jsdom = require("jsdom");
var _prosemirrorModel = require("prosemirror-model");
var _ukkonen = _interopRequireDefault(require("ukkonen"));
var _yProsemirror = require("y-prosemirror");
var Y = _interopRequireWildcard(require("yjs"));
var _textBetween = _interopRequireDefault(require("./../../../shared/editor/lib/textBetween"));
var _textSerializers = require("./../../../shared/editor/lib/textSerializers");
var _EditorStyleHelper = require("./../../../shared/editor/styles/EditorStyleHelper");
var _types = require("./../../../shared/types");
var _icon = require("./../../../shared/utils/icon");
var _editor = require("./../../editor");
var _tracer = require("./../../logging/tracer");
var _tracing = require("./../../logging/tracing");
var _ = require("./..");
var _diff = _interopRequireDefault(require("./../../utils/diff"));
var _ProsemirrorHelper = require("./ProsemirrorHelper");
var _TextHelper = require("./TextHelper");
var _dec, _class, _DocumentHelper;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let DocumentHelper = exports.DocumentHelper = (_dec = (0, _tracing.trace)(), _dec(_class = (_DocumentHelper = class DocumentHelper {
  /**
   * Returns the document as a Prosemirror Node. This method uses the derived content if available
   * then the collaborative state, otherwise it falls back to Markdown.
   *
   * @param document The document or revision to convert
   * @returns The document content as a Prosemirror Node
   */
  static toProsemirror(document) {
    if ("type" in document && document.type === "doc") {
      return _prosemirrorModel.Node.fromJSON(_editor.schema, document);
    }
    if ("content" in document && document.content) {
      return _prosemirrorModel.Node.fromJSON(_editor.schema, document.content);
    }
    if ("state" in document && document.state) {
      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, document.state);
      return _prosemirrorModel.Node.fromJSON(_editor.schema, (0, _yProsemirror.yDocToProsemirrorJSON)(ydoc, "default"));
    }
    const text = document instanceof _.Collection ? document.description : document.text;
    return _editor.parser.parse(text ?? "") || _prosemirrorModel.Node.fromJSON(_editor.schema, {});
  }

  /**
   * Returns the document as a plain JSON object. This method uses the derived content if available
   * then the collaborative state, otherwise it falls back to Markdown.
   *
   * @param document The document or revision to convert
   * @param options Options for the conversion
   * @returns The document content as a plain JSON object
   */
  static async toJSON(document, options) {
    let doc;
    let data;
    if ("content" in document && document.content) {
      // Optimized path for documents with content available and no transformation required.
      if (!options?.removeMarks && !options?.signedUrls && !options?.internalUrlBase) {
        return document.content;
      }
      doc = _prosemirrorModel.Node.fromJSON(_editor.schema, document.content);
    } else if ("state" in document && document.state) {
      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, document.state);
      doc = _prosemirrorModel.Node.fromJSON(_editor.schema, (0, _yProsemirror.yDocToProsemirrorJSON)(ydoc, "default"));
    } else if (document instanceof _.Collection) {
      doc = _editor.parser.parse(document.description ?? "");
    } else {
      doc = _editor.parser.parse(document.text);
    }
    if (doc && options?.signedUrls && options?.teamId) {
      data = await _ProsemirrorHelper.ProsemirrorHelper.signAttachmentUrls(doc, options.teamId, options.signedUrls);
    } else {
      data = doc?.toJSON() ?? {};
    }
    if (options?.internalUrlBase) {
      data = _ProsemirrorHelper.ProsemirrorHelper.replaceInternalUrls(data, options.internalUrlBase);
    }
    if (options?.removeMarks) {
      data = _ProsemirrorHelper.ProsemirrorHelper.removeMarks(data, options.removeMarks);
    }
    return data;
  }

  /**
   * Returns the document as plain text. This method uses the
   * collaborative state if available, otherwise it falls back to Markdown.
   *
   * @param document The document or revision or prosemirror data to convert
   * @returns The document content as plain text without formatting.
   */
  static toPlainText(document) {
    const node = DocumentHelper.toProsemirror(document);
    return (0, _textBetween.default)(node, 0, node.content.size, this.textSerializers);
  }

  /**
   * Returns the document as Markdown. This is a lossy conversion and should only be used for export.
   *
   * @param document The document or revision to convert
   * @returns The document title and content as a Markdown string
   */
  static toMarkdown(document) {
    const text = _editor.serializer.serialize(DocumentHelper.toProsemirror(document)).replace(/(^|\n)\\(\n|$)/g, "\n\n").replace(/“/g, '"').replace(/”/g, '"').replace(/‘/g, "'").replace(/’/g, "'").trim();
    if (document instanceof _.Collection) {
      return text;
    }
    if (document instanceof _.Document || document instanceof _.Revision) {
      const iconType = (0, _icon.determineIconType)(document.icon);
      const title = `${iconType === _types.IconType.Emoji ? document.icon + " " : ""}${document.title}`;
      return `# ${title}\n\n${text}`;
    }
    return text;
  }

  /**
   * Returns the document as plain HTML. This is a lossy conversion and should only be used for export.
   *
   * @param document The document or revision to convert
   * @param options Options for the HTML output
   * @returns The document title and content as a HTML string
   */
  static async toHTML(document, options) {
    const node = DocumentHelper.toProsemirror(document);
    let output = _ProsemirrorHelper.ProsemirrorHelper.toHTML(node, {
      title: options?.includeTitle !== false ? document.title : undefined,
      includeStyles: options?.includeStyles,
      includeMermaid: options?.includeMermaid,
      centered: options?.centered,
      baseUrl: options?.baseUrl
    });
    (0, _tracer.addTags)({
      documentId: document.id,
      options
    });
    if (options?.signedUrls) {
      const teamId = document instanceof _.Document ? document.teamId : (await document.$get("document"))?.teamId;
      if (!teamId) {
        return output;
      }
      output = await _TextHelper.TextHelper.attachmentsToSignedUrls(output, teamId, typeof options.signedUrls === "number" ? options.signedUrls : undefined);
    }
    return output;
  }

  /**
   * Parse a list of mentions contained in a document or revision
   *
   * @param document Document or Revision
   * @param options Attributes to use for filtering mentions
   * @returns An array of mentions in passed document or revision
   */
  static parseMentions(document, options) {
    const node = DocumentHelper.toProsemirror(document);
    return _ProsemirrorHelper.ProsemirrorHelper.parseMentions(node, options);
  }

  /**
   * Parse a list of document IDs contained in a document or revision
   *
   * @param document Document or Revision
   * @returns An array of identifiers in passed document or revision
   */
  static parseDocumentIds(document) {
    const node = DocumentHelper.toProsemirror(document);
    return _ProsemirrorHelper.ProsemirrorHelper.parseDocumentIds(node);
  }

  /**
   * Generates a HTML diff between documents or revisions.
   *
   * @param before The before document
   * @param after The after document
   * @param options Options passed to HTML generation
   * @returns The diff as a HTML string
   */
  static async diff(before, after) {
    let {
      signedUrls,
      ...options
    } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _tracer.addTags)({
      beforeId: before?.id,
      documentId: after.documentId,
      options
    });
    if (!before) {
      return await DocumentHelper.toHTML(after, {
        ...options,
        signedUrls
      });
    }
    const beforeHTML = await DocumentHelper.toHTML(before, options);
    const afterHTML = await DocumentHelper.toHTML(after, options);
    const beforeDOM = new _jsdom.JSDOM(beforeHTML);
    const afterDOM = new _jsdom.JSDOM(afterHTML);

    // Extract the content from the article tag and diff the HTML, we don't
    // care about the surrounding layout and stylesheets.
    let diffedContentAsHTML = (0, _diff.default)(beforeDOM.window.document.getElementsByTagName("article")[0].innerHTML, afterDOM.window.document.getElementsByTagName("article")[0].innerHTML);

    // Sign only the URLS in the diffed content
    if (signedUrls) {
      const teamId = before instanceof _.Document ? before.teamId : (await before.$get("document"))?.teamId;
      if (teamId) {
        diffedContentAsHTML = await _TextHelper.TextHelper.attachmentsToSignedUrls(diffedContentAsHTML, teamId, typeof signedUrls === "number" ? signedUrls : undefined);
      }
    }

    // Inject the diffed content into the original document with styling and
    // serialize back to a string.
    const article = beforeDOM.window.document.querySelector("article");
    if (article) {
      article.innerHTML = diffedContentAsHTML;
    }
    return beforeDOM.serialize();
  }

  /**
   * Generates a compact HTML diff between documents or revisions, the
   * diff is reduced up to show only the parts of the document that changed and
   * the immediate context. Breaks in the diff are denoted with
   * "div.diff-context-break" nodes.
   *
   * @param before The before document
   * @param after The after document
   * @param options Options passed to HTML generation
   * @returns The diff as a HTML string
   */
  static async toEmailDiff(before, after, options) {
    if (!before) {
      return "";
    }
    const html = await DocumentHelper.diff(before, after, options);
    const dom = new _jsdom.JSDOM(html);
    const doc = dom.window.document;
    const containsDiffElement = node => node && node.innerHTML.includes("data-operation-index");

    // The diffing lib isn't able to catch all changes currently, e.g. changing
    // the type of a mark will result in an empty diff.
    // see: https://github.com/tnwinc/htmldiff.js/issues/10
    if (!containsDiffElement(doc.querySelector("#content"))) {
      return;
    }

    // We use querySelectorAll to get a static NodeList as we'll be modifying
    // it as we iterate, rather than getting content.childNodes.
    const contents = doc.querySelectorAll("#content > *");
    let previousNodeRemoved = false;
    let previousDiffClipped = false;
    const br = doc.createElement("div");
    br.innerHTML = "…";
    br.className = "diff-context-break";
    for (const childNode of contents) {
      // If the block node contains a diff tag then we want to keep it
      if (containsDiffElement(childNode)) {
        if (previousNodeRemoved && previousDiffClipped) {
          childNode.parentElement?.insertBefore(br.cloneNode(true), childNode);
        }
        previousNodeRemoved = false;
        previousDiffClipped = true;

        // Special case for largetables, as this block can get very large we
        // want to clip it to only the changed rows and surrounding context.
        if (childNode.classList.contains(_EditorStyleHelper.EditorStyleHelper.table)) {
          const rows = childNode.querySelectorAll("tr");
          if (rows.length < 3) {
            continue;
          }
          let previousRowRemoved = false;
          let previousRowDiffClipped = false;
          for (const row of rows) {
            if (containsDiffElement(row)) {
              const cells = row.querySelectorAll("td");
              if (previousRowRemoved && previousRowDiffClipped) {
                const tr = doc.createElement("tr");
                const br = doc.createElement("td");
                br.colSpan = cells.length;
                br.innerHTML = "…";
                br.className = "diff-context-break";
                tr.appendChild(br);
                childNode.parentElement?.insertBefore(tr, childNode);
              }
              previousRowRemoved = false;
              previousRowDiffClipped = true;
              continue;
            }
            if (containsDiffElement(row.nextElementSibling)) {
              previousRowRemoved = false;
              continue;
            }
            if (containsDiffElement(row.previousElementSibling)) {
              previousRowRemoved = false;
              continue;
            }
            previousRowRemoved = true;
            row.remove();
          }
        }
        continue;
      }

      // If the block node does not contain a diff tag and the previous
      // block node did not contain a diff tag then remove the previous.
      if (childNode.nodeName === "P" && childNode.textContent && childNode.nextElementSibling?.nodeName === "P" && containsDiffElement(childNode.nextElementSibling)) {
        if (previousDiffClipped) {
          childNode.parentElement?.insertBefore(br.cloneNode(true), childNode);
        }
        previousNodeRemoved = false;
        continue;
      }
      if (childNode.nodeName === "P" && childNode.textContent && childNode.previousElementSibling?.nodeName === "P" && containsDiffElement(childNode.previousElementSibling)) {
        previousNodeRemoved = false;
        continue;
      }
      previousNodeRemoved = true;
      childNode.remove();
    }
    const head = doc.querySelector("head");
    const body = doc.querySelector("body");
    return `${head?.innerHTML} ${body?.innerHTML}`;
  }

  /**
   * Applies the given Markdown to the document, this essentially creates a
   * single change in the collaborative state that makes all the edits to get
   * to the provided Markdown.
   *
   * @param document The document to apply the changes to
   * @param text The markdown to apply
   * @param append If true appends the markdown instead of replacing existing
   * content
   * @returns The document
   */
  static applyMarkdownToDocument(document, text) {
    let append = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    document.text = append ? document.text + text : text;
    const doc = _editor.parser.parse(document.text);
    document.content = doc.toJSON();
    if (document.state) {
      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, document.state);
      const type = ydoc.get("default", Y.XmlFragment);
      if (!type.doc) {
        throw new Error("type.doc not found");
      }

      // apply new document to existing ydoc
      (0, _yProsemirror.updateYFragment)(type.doc, type, doc, new Map());
      const state = Y.encodeStateAsUpdate(ydoc);
      document.state = Buffer.from(state);
      document.changed("state", true);
    }
    return document;
  }

  /**
   * Compares two documents or revisions and returns whether the text differs by more than the threshold.
   *
   * @param document The document to compare
   * @param other The other document to compare
   * @param threshold The threshold for the change in characters
   * @returns True if the text differs by more than the threshold
   */
  static isChangeOverThreshold(before, after, threshold) {
    if (!before || !after) {
      return false;
    }
    const first = before.title + this.toPlainText(before);
    const second = after.title + this.toPlainText(after);
    const distance = (0, _ukkonen.default)(first, second, threshold + 1);
    return distance > threshold;
  }
}, _defineProperty(_DocumentHelper, "textSerializers", (0, _textSerializers.getTextSerializers)(_editor.schema)), _DocumentHelper)) || _class);