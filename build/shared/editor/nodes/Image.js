"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _urls = require("../../utils/urls");
var _Caption = _interopRequireDefault(require("../components/Caption"));
var _Image2 = _interopRequireDefault(require("../components/Image"));
var _SimpleImage = _interopRequireDefault(require("./SimpleImage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const imageSizeRegex = /\s=(\d+)?x(\d+)?$/;
const parseTitleAttribute = tokenTitle => {
  const attributes = {
    layoutClass: undefined,
    title: undefined,
    width: undefined,
    height: undefined
  };
  if (!tokenTitle) {
    return attributes;
  }
  ["right-50", "left-50", "full-width"].map(className => {
    if (tokenTitle.includes(className)) {
      attributes.layoutClass = className;
      tokenTitle = tokenTitle.replace(className, "");
    }
  });
  const match = tokenTitle.match(imageSizeRegex);
  if (match) {
    attributes.width = parseInt(match[1], 10);
    attributes.height = parseInt(match[2], 10);
    tokenTitle = tokenTitle.replace(imageSizeRegex, "");
  }
  attributes.title = tokenTitle;
  return attributes;
};
const downloadImageNode = async node => {
  const image = await fetch(node.attrs.src);
  const imageBlob = await image.blob();
  const imageURL = URL.createObjectURL(imageBlob);
  const extension = imageBlob.type.split(/\/|\+/g)[1];
  const potentialName = node.attrs.alt || "image";

  // create a temporary link node and click it with our image data
  const link = document.createElement("a");
  link.href = imageURL;
  link.download = `${potentialName}.${extension}`;
  document.body.appendChild(link);
  link.click();

  // cleanup
  document.body.removeChild(link);
};
class Image extends _SimpleImage.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "handleChangeSize", _ref => {
      let {
        node,
        getPos
      } = _ref;
      return _ref2 => {
        let {
          width,
          height
        } = _ref2;
        const {
          view
        } = this.editor;
        const {
          tr
        } = view.state;
        const pos = getPos();
        const transaction = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          width,
          height
        }).setMeta("addToHistory", true);
        const $pos = transaction.doc.resolve(getPos());
        view.dispatch(transaction.setSelection(new _prosemirrorState.NodeSelection($pos)));
      };
    });
    _defineProperty(this, "handleDownload", _ref3 => {
      let {
        node
      } = _ref3;
      return event => {
        event.preventDefault();
        event.stopPropagation();
        void downloadImageNode(node);
      };
    });
    _defineProperty(this, "handleCaptionKeyDown", _ref4 => {
      let {
        node,
        getPos
      } = _ref4;
      return event => {
        // Pressing Enter in the caption field should move the cursor/selection
        // below the image and create a new paragraph.
        if (event.key === "Enter") {
          event.preventDefault();
          const {
            view
          } = this.editor;
          const $pos = view.state.doc.resolve(getPos() + node.nodeSize);
          view.dispatch(view.state.tr.setSelection(_prosemirrorState.TextSelection.near($pos)).split($pos.pos).scrollIntoView());
          view.focus();
          return;
        }

        // Pressing Backspace in an an empty caption field focused the image.
        if (event.key === "Backspace" && event.currentTarget.innerText === "") {
          event.preventDefault();
          event.stopPropagation();
          const {
            view
          } = this.editor;
          const $pos = view.state.doc.resolve(getPos());
          const tr = view.state.tr.setSelection(new _prosemirrorState.NodeSelection($pos));
          view.dispatch(tr);
          view.focus();
          return;
        }
      };
    });
    _defineProperty(this, "handleCaptionBlur", _ref5 => {
      let {
        node,
        getPos
      } = _ref5;
      return event => {
        const caption = event.currentTarget.innerText;
        if (caption === node.attrs.alt) {
          return;
        }
        const {
          view
        } = this.editor;
        const {
          tr
        } = view.state;

        // update meta on object
        const pos = getPos();
        const transaction = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          alt: caption
        });
        view.dispatch(transaction);
      };
    });
    _defineProperty(this, "component", props => /*#__PURE__*/React.createElement(_Image2.default, _extends({}, props, {
      onClick: this.handleSelect(props),
      onDownload: this.handleDownload(props),
      onChangeSize: this.handleChangeSize(props)
    }), /*#__PURE__*/React.createElement(_Caption.default, {
      width: props.node.attrs.width,
      onBlur: this.handleCaptionBlur(props),
      onKeyDown: this.handleCaptionKeyDown(props),
      isSelected: props.isSelected,
      placeholder: this.options.dictionary.imageCaptionPlaceholder
    }, props.node.attrs.alt)));
  }
  get schema() {
    return {
      inline: true,
      attrs: {
        src: {
          default: "",
          validate: "string"
        },
        width: {
          default: undefined
        },
        height: {
          default: undefined
        },
        alt: {
          default: null,
          validate: "string|null"
        },
        layoutClass: {
          default: null,
          validate: "string|null"
        },
        title: {
          default: null,
          validate: "string|null"
        }
      },
      content: "text*",
      marks: "",
      group: "inline",
      selectable: true,
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1289000
      draggable: false,
      atom: true,
      parseDOM: [{
        tag: "div[class~=image]",
        getAttrs: dom => {
          const img = dom.getElementsByTagName("img")[0];
          const className = dom.className;
          const layoutClassMatched = className && className.match(/image-(.*)$/);
          const layoutClass = layoutClassMatched ? layoutClassMatched[1] : null;
          const width = img?.getAttribute("width");
          const height = img?.getAttribute("height");
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            title: img?.getAttribute("title"),
            width: width ? parseInt(width, 10) : undefined,
            height: height ? parseInt(height, 10) : undefined,
            layoutClass
          };
        }
      }, {
        tag: "img",
        getAttrs: dom => {
          const width = dom.getAttribute("width");
          const height = dom.getAttribute("height");
          return {
            src: dom.getAttribute("src"),
            alt: dom.getAttribute("alt"),
            title: dom.getAttribute("title"),
            width: width ? parseInt(width, 10) : undefined,
            height: height ? parseInt(height, 10) : undefined
          };
        }
      }],
      toDOM: node => {
        const className = node.attrs.layoutClass ? `image image-${node.attrs.layoutClass}` : "image";
        return ["div", {
          class: className
        }, ["img", {
          ...node.attrs,
          src: (0, _urls.sanitizeUrl)(node.attrs.src),
          width: node.attrs.width,
          height: node.attrs.height,
          contentEditable: "false"
        }], ["p", {
          class: "caption"
        }, 0]];
      },
      toPlainText: node => node.attrs.alt ? `(image: ${node.attrs.alt})` : "(image)"
    };
  }
  get plugins() {
    return [...super.plugins, new _prosemirrorState.Plugin({
      props: {
        handleKeyDown: (view, event) => {
          // prevent prosemirror's default spacebar behavior
          // & zoom in if the selected node is image
          if (event.key === " ") {
            const {
              state
            } = view;
            const {
              selection
            } = state;
            if (selection instanceof _prosemirrorState.NodeSelection) {
              const {
                node
              } = selection;
              if (node.type.name === "image") {
                const image = document.querySelector(".ProseMirror-selectednode img");
                image.click();
                return true;
              }
            }
          }
          return false;
        }
      }
    })];
  }
  toMarkdown(state, node) {
    // Skip the preceding space for images at the start of a list item or Markdown parsers may
    // render them as code blocks
    let markdown = state.inList ? "" : " ";
    markdown += "![" + state.esc((node.attrs.alt || "").replace("\n", "") || "", false) + "](" + state.esc(node.attrs.src || "", false);
    let size = "";
    if (node.attrs.width || node.attrs.height) {
      size = ` =${state.esc(node.attrs.width ? String(node.attrs.width) : "", false)}x${state.esc(node.attrs.height ? String(node.attrs.height) : "", false)}`;
    }
    if (node.attrs.layoutClass) {
      markdown += ' "' + state.esc(node.attrs.layoutClass, false) + size + '"';
    } else if (node.attrs.title) {
      markdown += ' "' + state.esc(node.attrs.title, false) + size + '"';
    } else if (size) {
      markdown += ' "' + size + '"';
    }
    markdown += ")";
    state.write(markdown);
  }
  parseMarkdown() {
    return {
      node: "image",
      getAttrs: token => ({
        src: token.attrGet("src"),
        alt: token?.children && token.children[0] && token.children[0].content || null,
        ...parseTitleAttribute(token?.attrGet("title") || "")
      })
    };
  }
  commands(_ref6) {
    let {
      type
    } = _ref6;
    return {
      ...super.commands({
        type
      }),
      downloadImage: () => state => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const {
          node
        } = state.selection;
        if (node.type.name !== "image") {
          return false;
        }
        void downloadImageNode(node);
        return true;
      },
      alignRight: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const attrs = {
          ...state.selection.node.attrs,
          title: null,
          layoutClass: "right-50"
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      },
      alignLeft: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const attrs = {
          ...state.selection.node.attrs,
          title: null,
          layoutClass: "left-50"
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      },
      alignFullWidth: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const attrs = {
          ...state.selection.node.attrs,
          title: null,
          layoutClass: "full-width"
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      },
      alignCenter: () => (state, dispatch) => {
        if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
          return false;
        }
        const attrs = {
          ...state.selection.node.attrs,
          layoutClass: null
        };
        const {
          selection
        } = state;
        dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, attrs));
        return true;
      }
    };
  }
  inputRules(_ref7) {
    let {
      type
    } = _ref7;
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
      const [okay, alt, src, matchedTitle] = match;
      const {
        tr
      } = state;
      if (okay) {
        tr.replaceWith(start - 1, end, type.create({
          src,
          alt,
          ...parseTitleAttribute(matchedTitle)
        }));
      }
      return tr;
    })];
  }
}
exports.default = Image;