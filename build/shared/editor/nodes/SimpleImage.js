"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _files = require("../../utils/files");
var _urls = require("../../utils/urls");
var _validations = require("../../validations");
var _insertFiles = _interopRequireDefault(require("../commands/insertFiles"));
var _Image = _interopRequireDefault(require("../components/Image"));
var _uploadPlaceholder = _interopRequireDefault(require("../lib/uploadPlaceholder"));
var _UploadPlugin = require("../plugins/UploadPlugin");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class SimpleImage extends _Node.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "handleSelect", _ref => {
      let {
        getPos
      } = _ref;
      return event => {
        event.preventDefault();
        const {
          view
        } = this.editor;
        const $pos = view.state.doc.resolve(getPos());
        const transaction = view.state.tr.setSelection(new _prosemirrorState.NodeSelection($pos));
        view.dispatch(transaction);
        view.focus();
      };
    });
    _defineProperty(this, "component", props => /*#__PURE__*/React.createElement(_Image.default, _extends({}, props, {
      onClick: this.handleSelect(props)
    })));
  }
  get name() {
    return "image";
  }
  get schema() {
    return {
      inline: true,
      attrs: {
        src: {
          default: ""
        },
        alt: {
          default: null
        }
      },
      content: "text*",
      marks: "",
      group: "inline",
      selectable: true,
      draggable: true,
      parseDOM: [{
        tag: "div[class~=image]",
        getAttrs: dom => {
          const img = dom.getElementsByTagName("img")[0];
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            title: img?.getAttribute("title")
          };
        }
      }, {
        tag: "img",
        getAttrs: dom => ({
          src: dom.getAttribute("src"),
          alt: dom.getAttribute("alt"),
          title: dom.getAttribute("title")
        })
      }],
      toDOM: node => ["div", {
        class: "image"
      }, ["img", {
        ...node.attrs,
        src: (0, _urls.sanitizeUrl)(node.attrs.src),
        contentEditable: "false"
      }]]
    };
  }
  keys() {
    return {
      Enter: (state, dispatch) => {
        const {
          selection
        } = state;
        if (selection instanceof _prosemirrorState.NodeSelection && selection.node?.type.name === this.name) {
          const tr = state.tr;
          if (dispatch) {
            dispatch(tr.insert(selection.to, state.schema.nodes.paragraph.create({})).setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(selection.to + 2), 1)).scrollIntoView());
          }
          return true;
        }
        return false;
      }
    };
  }
  toMarkdown(state, node) {
    state.write(" ![" + state.esc((node.attrs.alt || "").replace("\n", "") || "", false) + "](" + state.esc(node.attrs.src || "", false) + ")");
  }
  parseMarkdown() {
    return {
      node: "image",
      getAttrs: token => ({
        src: token.attrGet("src"),
        alt: token?.children && token.children[0] && token.children[0].content || null
      })
    };
  }
  commands(_ref2) {
    let {
      type
    } = _ref2;
    return {
      deleteImage: () => (state, dispatch) => {
        dispatch?.(state.tr.deleteSelection());
        return true;
      },
      replaceImage: () => state => {
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
          throw new Error("uploadFile prop is required to replace images");
        }
        if (node.type.name !== "image") {
          return false;
        }

        // create an input element and click to trigger picker
        const inputElement = document.createElement("input");
        inputElement.type = "file";
        inputElement.accept = _validations.AttachmentValidation.imageContentTypes.join(", ");
        inputElement.onchange = event => {
          const files = (0, _files.getEventFiles)(event);
          void (0, _insertFiles.default)(view, event, state.selection.from, files, {
            uploadFile,
            onFileUploadStart,
            onFileUploadStop,
            dictionary: this.options.dictionary,
            replaceExisting: true,
            attrs: {
              width: node.attrs.width
            }
          });
        };
        inputElement.click();
        return true;
      },
      createImage: attrs => (state, dispatch) => {
        const {
          selection
        } = state;
        const position = selection instanceof _prosemirrorState.TextSelection ? selection.$cursor?.pos : selection.$to.pos;
        if (position === undefined) {
          return false;
        }
        const node = type.create(attrs);
        const transaction = state.tr.insert(position, node);
        dispatch?.(transaction);
        return true;
      }
    };
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    /**
     * Matches following attributes in Markdown-typed image: [, alt, src, class]
     *
     * Example:
     * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
     * ![](image.jpg "class") -> [, "", "image.jpg", "small"]
     * ![Lorem](image.jpg "class") -> [, "Lorem", "image.jpg", "small"]
     */
    const IMAGE_INPUT_REGEX = /!\[(?<alt>[^\][]*?)]\((?<filename>[^\][]*?)(?=“|\))“?(?<layoutclass>[^\][”]+)?”?\)$/;
    return [new _prosemirrorInputrules.InputRule(IMAGE_INPUT_REGEX, (state, match, start, end) => {
      const [okay, alt, src] = match;
      const {
        tr
      } = state;
      if (okay) {
        tr.replaceWith(start - 1, end, type.create({
          src,
          alt
        }));
      }
      return tr;
    })];
  }
  get plugins() {
    return [_uploadPlaceholder.default, new _UploadPlugin.UploadPlugin(this.options)];
  }
}
exports.default = SimpleImage;