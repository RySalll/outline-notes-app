"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProsemirrorHelper = void 0;
var _jsdom = require("jsdom");
var _compact = _interopRequireDefault(require("lodash/compact"));
var _flatten = _interopRequireDefault(require("lodash/flatten"));
var _isEqual = _interopRequireDefault(require("lodash/isEqual"));
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _prosemirrorModel = require("prosemirror-model");
var React = _interopRequireWildcard(require("react"));
var _server = require("react-dom/server");
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _yProsemirror = require("y-prosemirror");
var Y = _interopRequireWildcard(require("yjs"));
var _Styles = _interopRequireDefault(require("./../../../shared/editor/components/Styles"));
var _embeds = _interopRequireDefault(require("./../../../shared/editor/embeds"));
var _globals = _interopRequireDefault(require("./../../../shared/styles/globals"));
var _theme = _interopRequireDefault(require("./../../../shared/styles/theme"));
var _types = require("./../../../shared/types");
var _ProsemirrorHelper = require("./../../../shared/utils/ProsemirrorHelper");
var _parseDocumentSlug = _interopRequireDefault(require("./../../../shared/utils/parseDocumentSlug"));
var _rtl = require("./../../../shared/utils/rtl");
var _urls = require("./../../../shared/utils/urls");
var _editor = require("./../../editor");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _tracing = require("./../../logging/tracing");
var _Attachment = _interopRequireDefault(require("./../Attachment"));
var _files = _interopRequireDefault(require("./../../storage/files"));
var _dec, _class;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let ProsemirrorHelper = exports.ProsemirrorHelper = (_dec = (0, _tracing.trace)(), _dec(_class = class ProsemirrorHelper {
  /**
   * Returns the input text as a Y.Doc.
   *
   * @param markdown The text to parse
   * @returns The content as a Y.Doc.
   */
  static toYDoc(input) {
    let fieldName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "default";
    if (typeof input === "object") {
      return (0, _yProsemirror.prosemirrorToYDoc)(ProsemirrorHelper.toProsemirror(input), fieldName);
    }
    let node = _editor.parser.parse(input);

    // in the editor embeds are created at runtime by converting links into
    // embeds where they match.Because we're converting to a CRDT structure on
    //  the server we need to mimic this behavior.
    function urlsToEmbeds(node) {
      if (node.type.name === "paragraph") {
        for (const textNode of node.content.content) {
          for (const embed of _embeds.default) {
            if (textNode.text && textNode.marks.some(m => m.type.name === "link" && m.attrs.href === textNode.text) && embed.matcher(textNode.text)) {
              return _editor.schema.nodes.embed.createAndFill({
                href: textNode.text
              });
            }
          }
        }
      }
      if (node.content) {
        const contentAsArray = node.content instanceof _prosemirrorModel.Fragment ? node.content.content : node.content;
        // @ts-expect-error content
        node.content = _prosemirrorModel.Fragment.fromArray(contentAsArray.map(urlsToEmbeds));
      }
      return node;
    }
    if (node) {
      node = urlsToEmbeds(node);
    }
    return node ? (0, _yProsemirror.prosemirrorToYDoc)(node, fieldName) : new Y.Doc();
  }

  /**
   * Returns the input Y.Doc encoded as a YJS state update.
   *
   * @param ydoc The Y.Doc to encode
   * @returns The content as a YJS state update
   */
  static toState(ydoc) {
    return Buffer.from(Y.encodeStateAsUpdate(ydoc));
  }

  /**
   * Converts a plain object into a Prosemirror Node.
   *
   * @param data The object to parse
   * @returns The content as a Prosemirror Node
   */
  static toProsemirror(data) {
    return _prosemirrorModel.Node.fromJSON(_editor.schema, data);
  }

  /**
   * Returns an array of attributes of all mentions in the node.
   *
   * @param node The node to parse mentions from
   * @param options Attributes to use for filtering mentions
   * @returns An array of mention attributes
   */
  static parseMentions(doc, options) {
    const mentions = [];
    const isApplicableNode = node => {
      if (node.type.name !== "mention") {
        return false;
      }
      if (options?.type && options.type !== node.attrs.type || options?.modelId && options.modelId !== node.attrs.modelId) {
        return false;
      }
      return !mentions.some(m => m.id === node.attrs.id);
    };
    doc.descendants(node => {
      if (isApplicableNode(node)) {
        mentions.push(node.attrs);
        return false;
      }
      if (!node.content.size) {
        return false;
      }
      return true;
    });
    return mentions;
  }

  /**
   * Returns an array of document IDs referenced through links or mentions in the node.
   *
   * @param node The node to parse document IDs from
   * @returns An array of document IDs
   */
  static parseDocumentIds(doc) {
    const identifiers = [];
    doc.descendants(node => {
      if (node.type.name === "mention" && node.attrs.type === _types.MentionType.Document && !identifiers.includes(node.attrs.modelId)) {
        identifiers.push(node.attrs.modelId);
        return true;
      }
      if (node.type.name === "text") {
        // get marks for text nodes
        node.marks.forEach(mark => {
          // any of the marks identifiers?
          if (mark.type.name === "link") {
            const slug = (0, _parseDocumentSlug.default)(mark.attrs.href);

            // don't return the same link more than once
            if (slug && !identifiers.includes(slug)) {
              identifiers.push(slug);
            }
          }
        });
      }
      if (!node.content.size) {
        return false;
      }
      return true;
    });
    return identifiers;
  }

  /**
   * Find the nearest ancestor block node which contains the mention.
   *
   * @param doc The top-level doc node of a document / revision.
   * @param mention The mention for which the ancestor node is needed.
   * @returns A new top-level doc node with the ancestor node as the only child.
   */
  static getNodeForMentionEmail(doc, mention) {
    let blockNode;
    const potentialBlockNodes = ["table", "checkbox_list", "heading", "paragraph"];
    const isNodeContainingMention = node => {
      let foundMention = false;
      node.descendants(childNode => {
        if (childNode.type.name === "mention" && (0, _isEqual.default)(childNode.attrs, mention)) {
          foundMention = true;
          return false;
        }

        // No need to traverse other descendants once we find the mention.
        if (foundMention) {
          return false;
        }
        return true;
      });
      return foundMention;
    };
    doc.descendants(node => {
      // No need to traverse other descendants once we find the containing block node.
      if (blockNode) {
        return false;
      }
      if (potentialBlockNodes.includes(node.type.name)) {
        if (isNodeContainingMention(node)) {
          blockNode = node;
        }
        return false;
      }
      return true;
    });

    // Use the containing block node to maintain structure during serialization.
    // Minify to include mentioned child only.
    if (blockNode && !["heading", "paragraph"].includes(blockNode.type.name)) {
      const children = [];
      blockNode.forEach(child => {
        if (isNodeContainingMention(child)) {
          children.push(child);
        }
      });
      blockNode = blockNode.copy(_prosemirrorModel.Fragment.fromArray(children));
    }

    // Return a new top-level "doc" node to maintain structure during serialization.
    return blockNode ? doc.copy(_prosemirrorModel.Fragment.fromArray([blockNode])) : undefined;
  }

  /**
   * Removes all marks from the node that match the given types.
   *
   * @param data The ProsemirrorData object to remove marks from
   * @param marks The mark types to remove
   * @returns The content with marks removed
   */
  static removeMarks(doc, marks) {
    const json = "toJSON" in doc ? doc.toJSON() : doc;
    function removeMarksInner(node) {
      if (node.marks) {
        node.marks = node.marks.filter(mark => !marks.includes(mark.type));
      }
      if (node.content) {
        node.content.forEach(removeMarksInner);
      }
      return node;
    }
    return removeMarksInner(json);
  }
  static async replaceInternalUrls(doc, basePath) {
    const json = "toJSON" in doc ? doc.toJSON() : doc;
    if (basePath.endsWith("/")) {
      throw new Error("internalUrlBase must not end with a slash");
    }
    function replaceUrl(url) {
      return url.replace(`/doc/`, `${basePath}/doc/`);
    }
    function replaceInternalUrlsInner(node) {
      if (typeof node.attrs?.href === "string") {
        node.attrs.href = replaceUrl(node.attrs.href);
      } else if (node.marks) {
        node.marks.forEach(mark => {
          if (typeof mark.attrs?.href === "string" && (0, _urls.isInternalUrl)(mark.attrs?.href)) {
            mark.attrs.href = replaceUrl(mark.attrs.href);
          }
        });
      }
      if (node.content) {
        node.content.forEach(replaceInternalUrlsInner);
      }
      return node;
    }
    return replaceInternalUrlsInner(json);
  }

  /**
   * Returns the document as a plain JSON object with attachment URLs signed.
   *
   * @param node The node to convert to JSON
   * @param teamId The team ID to use for signing
   * @param expiresIn The number of seconds until the signed URL expires
   * @returns The content as a JSON object
   */
  static async signAttachmentUrls(doc, teamId) {
    let expiresIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 60;
    const attachmentIds = ProsemirrorHelper.parseAttachmentIds(doc);
    const attachments = await _Attachment.default.findAll({
      where: {
        id: attachmentIds,
        teamId
      }
    });
    const mapping = {};
    await Promise.all(attachments.map(async attachment => {
      const signedUrl = await _files.default.getSignedUrl(attachment.key, expiresIn);
      mapping[attachment.redirectUrl] = signedUrl;
    }));
    const json = doc.toJSON();
    function getMapping(href) {
      let relativeHref;
      try {
        const url = new URL(href);
        relativeHref = url.toString().substring(url.origin.length);
      } catch {
        // Noop: Invalid url.
      }
      for (const originalUrl of Object.keys(mapping)) {
        if (href.startsWith(originalUrl) || relativeHref?.startsWith(originalUrl)) {
          return mapping[originalUrl];
        }
      }
      return href;
    }
    function replaceAttachmentUrls(node) {
      if (node.attrs?.src) {
        node.attrs.src = getMapping(String(node.attrs.src));
      } else if (node.attrs?.href) {
        node.attrs.href = getMapping(String(node.attrs.href));
      } else if (node.marks) {
        node.marks.forEach(mark => {
          if (mark.attrs?.href) {
            mark.attrs.href = getMapping(String(mark.attrs.href));
          }
        });
      }
      if (node.content) {
        node.content.forEach(replaceAttachmentUrls);
      }
      return node;
    }
    return replaceAttachmentUrls(json);
  }

  /**
   * Returns an array of attachment IDs in the node.
   *
   * @param node The node to parse attachments from
   * @returns An array of attachment IDs
   */
  static parseAttachmentIds(doc) {
    const urls = [];
    doc.descendants(node => {
      node.marks.forEach(mark => {
        if (mark.type.name === "link") {
          if (mark.attrs.href) {
            urls.push(mark.attrs.href);
          }
        }
      });
      if (["image", "video"].includes(node.type.name)) {
        if (node.attrs.src) {
          urls.push(node.attrs.src);
        }
      }
      if (node.type.name === "attachment") {
        if (node.attrs.href) {
          urls.push(node.attrs.href);
        }
      }
    });
    return (0, _uniq.default)((0, _compact.default)((0, _flatten.default)(urls.map(url => [...url.matchAll(_ProsemirrorHelper.attachmentRedirectRegex)].map(match => match.groups?.id)))));
  }

  /**
   * Returns the node as HTML. This is a lossy conversion and should only be used
   * for export.
   *
   * @param node The node to convert to HTML
   * @param options Options for the HTML output
   * @returns The content as a HTML string
   */
  static toHTML(node, options) {
    const sheet = new _styledComponents.ServerStyleSheet();
    let html = "";
    let styleTags = "";
    const Centered = options?.centered ? _styledComponents.default.article`
          max-width: 46em;
          margin: 0 auto;
          padding: 0 1em;
        ` : "article";
    const rtl = (0, _rtl.isRTL)(node.textContent);
    const content = /*#__PURE__*/React.createElement("div", {
      id: "content",
      className: "ProseMirror"
    });
    const children = /*#__PURE__*/React.createElement(React.Fragment, null, options?.title && /*#__PURE__*/React.createElement("h1", {
      dir: rtl ? "rtl" : "ltr"
    }, options.title), options?.includeStyles !== false ? /*#__PURE__*/React.createElement(_Styles.default, {
      dir: rtl ? "rtl" : "ltr",
      rtl: rtl,
      staticHTML: true
    }, content) : content);

    // First render the containing document which has all the editor styles,
    // global styles, layout and title.
    try {
      html = (0, _server.renderToString)(sheet.collectStyles(/*#__PURE__*/React.createElement(_styledComponents.ThemeProvider, {
        theme: _theme.default
      }, /*#__PURE__*/React.createElement(React.Fragment, null, options?.includeStyles === false ? /*#__PURE__*/React.createElement("article", null, children) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_globals.default, {
        staticHTML: true
      }), /*#__PURE__*/React.createElement(Centered, null, children))))));
      styleTags = sheet.getStyleTags();
    } catch (error) {
      _Logger.default.error("Failed to render styles on node HTML conversion", error);
    } finally {
      sheet.seal();
    }

    // Render the Prosemirror document using virtual DOM and serialize the
    // result to a string
    const dom = new _jsdom.JSDOM(`<!DOCTYPE html>${options?.includeStyles === false ? "" : styleTags}${html}`);
    const doc = dom.window.document;
    const target = doc.getElementById("content");
    _prosemirrorModel.DOMSerializer.fromSchema(_editor.schema).serializeFragment(node.content, {
      document: doc
    },
    // @ts-expect-error incorrect library type, third argument is target node
    target);

    // Convert relative urls to absolute
    if (options?.baseUrl) {
      const elements = doc.querySelectorAll("a[href]");
      for (const el of elements) {
        if ("href" in el && el.href.startsWith("/")) {
          el.href = new URL(el.href, options.baseUrl).toString();
        }
      }
    }

    // Inject mermaidjs scripts if the document contains mermaid diagrams
    if (options?.includeMermaid) {
      const mermaidElements = dom.window.document.querySelectorAll(`[data-language="mermaidjs"] pre code`);

      // Unwrap <pre> tags to enable Mermaid script to correctly render inner content
      for (const el of mermaidElements) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
          parent.setAttribute("class", "mermaid");
        }
      }
      const element = dom.window.document.createElement("script");
      element.setAttribute("type", "module");

      // Inject Mermaid script
      if (mermaidElements.length) {
        element.innerHTML = `
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
          mermaid.initialize({
            startOnLoad: true,
            fontFamily: "inherit",
          });
          window.status = "ready";
        `;
      } else {
        element.innerHTML = `
          window.status = "ready";
        `;
      }
      dom.window.document.body.appendChild(element);
    }
    return dom.serialize();
  }
}) || _class);