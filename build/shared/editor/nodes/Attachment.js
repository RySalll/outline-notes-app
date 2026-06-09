"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _outlineIcons = require("outline-icons");
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _reactI18next = require("react-i18next");
var _files = require("../../utils/files");
var _urls = require("../../utils/urls");
var _insertFiles = _interopRequireDefault(require("../commands/insertFiles"));
var _toggleWrap = _interopRequireDefault(require("../commands/toggleWrap"));
var _FileExtension = _interopRequireDefault(require("../components/FileExtension"));
var _Widget = _interopRequireDefault(require("../components/Widget"));
var _links = _interopRequireDefault(require("../rules/links"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Attachment extends _Node.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "handleSelect", _ref => {
      let {
        getPos
      } = _ref;
      return () => {
        const {
          view
        } = this.editor;
        const $pos = view.state.doc.resolve(getPos());
        const transaction = view.state.tr.setSelection(new _prosemirrorState.NodeSelection($pos));
        view.dispatch(transaction);
      };
    });
    _defineProperty(this, "component", props => {
      const {
        isSelected,
        isEditable,
        theme,
        node
      } = props;
      return /*#__PURE__*/React.createElement(_Widget.default, {
        icon: /*#__PURE__*/React.createElement(_FileExtension.default, {
          title: node.attrs.title
        }),
        href: node.attrs.href,
        title: node.attrs.title,
        onMouseDown: this.handleSelect(props),
        onDoubleClick: () => {
          this.editor.commands.downloadAttachment();
        },
        onClick: event => {
          if (isEditable) {
            event.preventDefault();
            event.stopPropagation();
          }
        },
        context: node.attrs.href ? (0, _files.bytesToHumanReadable)(node.attrs.size || "0") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_reactI18next.Trans, null, "Uploading"), "\u2026"),
        isSelected: isSelected,
        theme: theme
      }, node.attrs.href && !isEditable && /*#__PURE__*/React.createElement(_outlineIcons.DownloadIcon, {
        size: 20
      }));
    });
  }
  get name() {
    return "attachment";
  }
  get rulePlugins() {
    return [_links.default];
  }
  get schema() {
    return {
      attrs: {
        id: {
          default: null
        },
        href: {
          default: null
        },
        title: {},
        size: {
          default: 0
        }
      },
      group: "block",
      defining: true,
      atom: true,
      parseDOM: [{
        priority: 100,
        tag: "a.attachment",
        getAttrs: dom => ({
          id: dom.id,
          title: dom.innerText,
          href: dom.getAttribute("href"),
          size: parseInt(dom.dataset.size || "0", 10)
        })
      }],
      toDOM: node => ["a", {
        class: `attachment`,
        id: node.attrs.id,
        href: (0, _urls.sanitizeUrl)(node.attrs.href),
        download: node.attrs.title,
        "data-size": node.attrs.size
      }, String(node.attrs.title)],
      toPlainText: node => node.attrs.title
    };
  }
  commands(_ref2) {
    let {
      type
    } = _ref2;
    return {
      createAttachment: attrs => (0, _toggleWrap.default)(type, attrs),
      deleteAttachment: () => (state, dispatch) => {
        dispatch?.(state.tr.deleteSelection());
        return true;
      },
      replaceAttachment: () => state => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const {
          view
        } = this.editor;
        const {
          node
        } = state.selection;
        const {
          uploadFile,
          onFileUploadStart,
          onFileUploadStop
        } = this.editor.props;
        if (!uploadFile) {
          throw new Error("uploadFile prop is required to replace attachments");
        }
        if (node.type.name !== "attachment") {
          return false;
        }

        // create an input element and click to trigger picker
        const inputElement = document.createElement("input");
        inputElement.type = "file";
        inputElement.onchange = event => {
          const files = (0, _files.getEventFiles)(event);
          void (0, _insertFiles.default)(view, event, state.selection.from, files, {
            uploadFile,
            onFileUploadStart,
            onFileUploadStop,
            dictionary: this.options.dictionary,
            replaceExisting: true
          });
        };
        inputElement.click();
        return true;
      },
      downloadAttachment: () => state => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const {
          node
        } = state.selection;

        // create a temporary link node and click it
        const link = document.createElement("a");
        link.href = node.attrs.href;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();

        // cleanup
        document.body.removeChild(link);
        return true;
      }
    };
  }
  toMarkdown(state, node) {
    state.ensureNewLine();
    state.write(`[${node.attrs.title} ${node.attrs.size}](${node.attrs.href})\n\n`);
    state.ensureNewLine();
  }
  parseMarkdown() {
    return {
      node: "attachment",
      getAttrs: tok => ({
        href: tok.attrGet("href"),
        title: tok.attrGet("title"),
        size: tok.attrGet("size")
      })
    };
  }
}
exports.default = Attachment;