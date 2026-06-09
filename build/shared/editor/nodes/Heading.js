"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _sonner = require("sonner");
var _Storage = _interopRequireDefault(require("../../utils/Storage"));
var _backspaceToParagraph = _interopRequireDefault(require("../commands/backspaceToParagraph"));
var _splitHeading = _interopRequireDefault(require("../commands/splitHeading"));
var _toggleBlockType = _interopRequireDefault(require("../commands/toggleBlockType"));
var _headingToSlug = _interopRequireWildcard(require("../lib/headingToSlug"));
var _findCollapsedNodes = require("../queries/findCollapsedNodes");
var _Node = _interopRequireDefault(require("./Node"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Heading extends _Node.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "className", "heading-name");
    _defineProperty(this, "handleFoldContent", event => {
      event.preventDefault();
      if (!(event.currentTarget instanceof HTMLButtonElement) || event.button !== 0) {
        return;
      }
      const {
        view
      } = this.editor;
      const hadFocus = view.hasFocus();
      const {
        tr
      } = view.state;
      const {
        top,
        left
      } = event.currentTarget.getBoundingClientRect();
      const result = view.posAtCoords({
        top,
        left
      });
      if (result) {
        const node = view.state.doc.nodeAt(result.inside);
        if (node) {
          const endOfHeadingPos = result.inside + node.nodeSize;
          const $pos = view.state.doc.resolve(endOfHeadingPos);
          const collapsed = !node.attrs.collapsed;
          if (collapsed && view.state.selection.to > endOfHeadingPos) {
            // move selection to the end of the collapsed heading
            tr.setSelection(_prosemirrorState.Selection.near($pos, -1));
          }
          const transaction = tr.setNodeMarkup(result.inside, undefined, {
            ...node.attrs,
            collapsed
          });
          const persistKey = (0, _headingToSlug.headingToPersistenceKey)(node, this.editor.props.id);
          if (collapsed) {
            _Storage.default.set(persistKey, "collapsed");
          } else {
            _Storage.default.remove(persistKey);
          }
          view.dispatch(transaction);
          if (hadFocus) {
            view.focus();
          }
        }
      }
    });
    _defineProperty(this, "handleCopyLink", event => {
      // this is unfortunate but appears to be the best way to grab the anchor
      // as it's added directly to the dom by a decoration.
      const anchor = event.currentTarget instanceof HTMLButtonElement && event.currentTarget.parentNode?.parentNode?.previousSibling;
      if (!anchor || !anchor.className.includes(this.className)) {
        throw new Error("Did not find anchor as previous sibling of heading");
      }
      const hash = `#${anchor.id}`;

      // the existing url might contain a hash already, lets make sure to remove
      // that rather than appending another one.
      const normalizedUrl = window.location.href.split("#")[0].replace("/edit", "");
      (0, _copyToClipboard.default)(normalizedUrl + hash);
      _sonner.toast.message(this.options.dictionary.linkCopied);
    });
  }
  get name() {
    return "heading";
  }
  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4],
      collapsed: undefined
    };
  }
  get schema() {
    return {
      attrs: {
        level: {
          default: 1,
          validate: "number"
        },
        collapsed: {
          default: undefined
        }
      },
      content: "inline*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map(level => ({
        tag: `h${level}`,
        attrs: {
          level
        },
        contentElement: node => node.querySelector(".heading-content") || node
      })),
      toDOM: node => {
        let anchor, fold;
        if (typeof document !== "undefined") {
          anchor = document.createElement("button");
          anchor.innerText = "#";
          anchor.type = "button";
          anchor.className = "heading-anchor";
          anchor.addEventListener("click", this.handleCopyLink);
          fold = document.createElement("button");
          fold.innerText = "";
          fold.innerHTML = '<svg fill="currentColor" width="12" height="24" viewBox="6 0 12 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.23823905,10.6097108 L11.207376,14.4695888 L11.207376,14.4695888 C11.54411,14.907343 12.1719566,14.989236 12.6097108,14.652502 C12.6783439,14.5997073 12.7398293,14.538222 12.792624,14.4695888 L15.761761,10.6097108 L15.761761,10.6097108 C16.0984949,10.1719566 16.0166019,9.54410997 15.5788477,9.20737601 C15.4040391,9.07290785 15.1896811,9 14.969137,9 L9.03086304,9 L9.03086304,9 C8.47857829,9 8.03086304,9.44771525 8.03086304,10 C8.03086304,10.2205442 8.10377089,10.4349022 8.23823905,10.6097108 Z" /></svg>';
          fold.type = "button";
          fold.className = `heading-fold ${node.attrs.collapsed ? "collapsed" : ""}`;
          fold.addEventListener("mousedown", event => this.handleFoldContent(event));
        }
        return [`h${node.attrs.level + (this.options.offset || 0)}`, {
          dir: "auto"
        }, ["span", {
          contentEditable: "false",
          class: `heading-actions ${node.attrs.collapsed ? "collapsed" : ""}`
        }, ...(anchor ? [anchor, fold] : [])], ["span", {
          class: "heading-content"
        }, 0]];
      }
    };
  }
  toMarkdown(state, node) {
    state.write(state.repeat("#", node.attrs.level) + " ");
    state.renderInline(node);
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      block: "heading",
      getAttrs: token => ({
        level: +token.tag.slice(1)
      })
    };
  }
  commands(_ref) {
    let {
      type,
      schema
    } = _ref;
    return attrs => (0, _toggleBlockType.default)(type, schema.nodes.paragraph, attrs);
  }
  keys(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    const options = this.options.levels.reduce((items, level) => ({
      ...items,
      ...{
        [`Shift-Ctrl-${level}`]: (0, _toggleBlockType.default)(type, schema.nodes.paragraph, {
          level
        })
      }
    }), {});
    return {
      ...options,
      Backspace: (0, _backspaceToParagraph.default)(type),
      Enter: (0, _splitHeading.default)(type)
    };
  }
  get plugins() {
    const getAnchors = doc => {
      const decorations = [];
      const previouslySeen = {};
      doc.descendants((node, pos) => {
        if (node.type.name !== this.name) {
          return;
        }

        // calculate the optimal id
        const slug = (0, _headingToSlug.default)(node);
        let id = slug;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[slug] > 0) {
          id = (0, _headingToSlug.default)(node, previouslySeen[slug]);
        }

        // record that we've seen this slug for the next loop
        previouslySeen[slug] = previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;
        decorations.push(_prosemirrorView.Decoration.widget(pos, () => {
          const anchor = document.createElement("a");
          anchor.id = id;
          anchor.className = this.className;
          return anchor;
        }, {
          side: -1,
          key: id
        }));
      });
      return _prosemirrorView.DecorationSet.create(doc, decorations);
    };
    const plugin = new _prosemirrorState.Plugin({
      state: {
        init: (config, state) => getAnchors(state.doc),
        apply: (tr, oldState) => tr.docChanged ? getAnchors(tr.doc) : oldState
      },
      props: {
        decorations: state => plugin.getState(state)
      }
    });
    const foldPlugin = new _prosemirrorState.Plugin({
      props: {
        decorations: state => {
          const {
            doc
          } = state;
          const decorations = (0, _findCollapsedNodes.findCollapsedNodes)(doc).map(block => _prosemirrorView.Decoration.node(block.pos, block.pos + block.node.nodeSize, {
            class: "folded-content"
          }));
          return _prosemirrorView.DecorationSet.create(doc, decorations);
        }
      }
    });
    return [foldPlugin, plugin];
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return this.options.levels.map(level => (0, _prosemirrorInputrules.textblockTypeInputRule)(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
      level
    })));
  }
}
exports.default = Heading;