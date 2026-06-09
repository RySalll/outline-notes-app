"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _urls = require("../../utils/urls");
var _toggleWrap = _interopRequireDefault(require("../commands/toggleWrap"));
var _Caption = _interopRequireDefault(require("../components/Caption"));
var _Video2 = _interopRequireDefault(require("../components/Video"));
var _links = _interopRequireDefault(require("../rules/links"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Video extends _Node.default {
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
    _defineProperty(this, "handleChangeSize", _ref2 => {
      let {
        node,
        getPos
      } = _ref2;
      return _ref3 => {
        let {
          width,
          height
        } = _ref3;
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
    _defineProperty(this, "handleCaptionKeyDown", _ref4 => {
      let {
        node,
        getPos
      } = _ref4;
      return event => {
        // Pressing Enter in the caption field should move the cursor/selection
        // below the video
        if (event.key === "Enter") {
          event.preventDefault();
          const {
            view
          } = this.editor;
          const $pos = view.state.doc.resolve(getPos() + node.nodeSize);
          view.dispatch(view.state.tr.setSelection(_prosemirrorState.TextSelection.near($pos)).scrollIntoView());
          view.focus();
          return;
        }

        // Pressing Backspace in an an empty caption field focuses the video.
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
        if (caption === node.attrs.title) {
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
          title: caption
        });
        view.dispatch(transaction);
      };
    });
    _defineProperty(this, "component", props => /*#__PURE__*/React.createElement(_Video2.default, _extends({}, props, {
      onChangeSize: this.handleChangeSize(props)
    }), /*#__PURE__*/React.createElement(_Caption.default, {
      width: props.node.attrs.width,
      onBlur: this.handleCaptionBlur(props),
      onKeyDown: this.handleCaptionKeyDown(props),
      isSelected: props.isSelected,
      placeholder: this.options.dictionary.imageCaptionPlaceholder
    }, props.node.attrs.title)));
  }
  get name() {
    return "video";
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
        src: {
          default: null
        },
        width: {
          default: null
        },
        height: {
          default: null
        },
        title: {
          default: null,
          validate: "string|null"
        }
      },
      group: "block",
      selectable: true,
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1289000
      draggable: false,
      defining: true,
      atom: true,
      parseDOM: [{
        priority: 100,
        tag: "video",
        getAttrs: dom => ({
          id: dom.id,
          title: dom.getAttribute("title"),
          src: dom.getAttribute("src"),
          width: parseInt(dom.getAttribute("width") ?? "", 10),
          height: parseInt(dom.getAttribute("height") ?? "", 10)
        })
      }],
      toDOM: node => ["div", {
        class: "video"
      }, ["video", {
        id: node.attrs.id,
        src: (0, _urls.sanitizeUrl)(node.attrs.src),
        controls: true,
        width: node.attrs.width,
        height: node.attrs.height
      }, String(node.attrs.title)]],
      toPlainText: node => node.attrs.title
    };
  }
  commands(_ref6) {
    let {
      type
    } = _ref6;
    return attrs => (0, _toggleWrap.default)(type, attrs);
  }
  toMarkdown(state, node) {
    state.ensureNewLine();
    state.write(`[${node.attrs.title} ${node.attrs.width}x${node.attrs.height}](${node.attrs.src})\n\n`);
    state.ensureNewLine();
  }
  parseMarkdown() {
    return {
      node: "video",
      getAttrs: tok => ({
        src: tok.attrGet("src"),
        title: tok.attrGet("title"),
        width: parseInt(tok.attrGet("width") ?? "", 10),
        height: parseInt(tok.attrGet("height") ?? "", 10)
      })
    };
  }
}
exports.default = Video;