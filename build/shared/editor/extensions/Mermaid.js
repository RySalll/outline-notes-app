"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Mermaid;
var _debounce = _interopRequireDefault(require("lodash/debounce"));
var _last = _interopRequireDefault(require("lodash/last"));
var _sortBy = _interopRequireDefault(require("lodash/sortBy"));
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _uuid = require("uuid");
var _isCode = require("../lib/isCode");
var _multiplayer = require("../lib/multiplayer");
var _findChildren = require("../queries/findChildren");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Cache {
  static get(key) {
    return this.data.get(key);
  }
  static set(key, value) {
    this.data.set(key, value);
    if (this.data.size > this.maxSize) {
      this.data.delete(this.data.keys().next().value);
    }
  }
}
_defineProperty(Cache, "maxSize", 20);
_defineProperty(Cache, "data", new Map());
let mermaid;
class MermaidRenderer {
  constructor() {
    _defineProperty(this, "diagramId", void 0);
    _defineProperty(this, "element", void 0);
    _defineProperty(this, "elementId", void 0);
    _defineProperty(this, "renderImmediately", async (block, isDark) => {
      const element = this.element;
      const text = block.node.textContent;
      const cacheKey = `${isDark ? "dark" : "light"}-${text}`;
      const cache = Cache.get(cacheKey);
      if (cache) {
        element.classList.remove("parse-error", "empty");
        element.innerHTML = cache;
        return;
      }

      // Create a temporary element that will render the diagram off-screen. This is necessary
      // as Mermaid will error if the element is not visible, such as if the heading is collapsed
      const renderElement = document.createElement("div");
      renderElement.style.position = "absolute";
      renderElement.style.left = "-9999px";
      renderElement.style.top = "-9999px";
      document.body.appendChild(renderElement);
      try {
        mermaid ??= (await Promise.resolve().then(() => _interopRequireWildcard(require("mermaid")))).default;
        mermaid.initialize({
          startOnLoad: true,
          // TODO: Make dynamic based on the width of the editor or remove in
          // the future if Mermaid is able to handle this automatically.
          gantt: {
            useWidth: 700
          },
          pie: {
            useWidth: 700
          },
          fontFamily: "inherit",
          theme: isDark ? "dark" : "default",
          darkMode: isDark
        });
        const {
          svg,
          bindFunctions
        } = await mermaid.render(`mermaid-diagram-${this.diagramId}`, text,
        // If the element is not visible we use an off-screen element to render the diagram
        element.offsetParent === null ? renderElement : element);
        this.currentTextContent = text;

        // Cache the rendered SVG so we won't need to calculate it again in the same session
        if (text) {
          Cache.set(cacheKey, svg);
        }
        element.classList.remove("parse-error", "empty");
        element.innerHTML = svg;

        // Allow the user to interact with the diagram
        bindFunctions?.(element);
      } catch (error) {
        const isEmpty = block.node.textContent.trim().length === 0;
        if (isEmpty) {
          element.innerText = "Empty diagram";
          element.classList.add("empty");
        } else {
          element.innerText = error;
          element.classList.add("parse-error");
        }
      } finally {
        renderElement.remove();
      }
    });
    _defineProperty(this, "currentTextContent", "");
    _defineProperty(this, "_rendererFunc", void 0);
    this.diagramId = (0, _uuid.v4)();
    this.elementId = `mermaid-diagram-wrapper-${this.diagramId}`;
    this.element = document.getElementById(this.elementId) || document.createElement("div");
    this.element.id = this.elementId;
    this.element.classList.add("mermaid-diagram-wrapper");
  }
  get render() {
    if (this._rendererFunc) {
      return this._rendererFunc;
    }
    this._rendererFunc = (0, _debounce.default)(this.renderImmediately, 250);
    return this.renderImmediately;
  }
}
function overlap(start1, end1, start2, end2) {
  return Math.max(0, Math.min(end1, end2) - Math.max(start1, start2));
}
/*
  This code find the decoration that overlap the most with a given node.
  This will ensure we can find the best decoration that match the last change set
  See: https://github.com/outline/outline/pull/5852/files#r1334929120
*/
function findBestOverlapDecoration(decorations, block) {
  if (decorations.length === 0) {
    return undefined;
  }
  return (0, _last.default)((0, _sortBy.default)(decorations, decoration => overlap(decoration.from, decoration.to, block.pos, block.pos + block.node.nodeSize)));
}
function getNewState(_ref) {
  let {
    doc,
    name,
    pluginState
  } = _ref;
  const decorations = [];

  // Find all blocks that represent Mermaid diagrams
  const blocks = (0, _findChildren.findBlockNodes)(doc).filter(item => item.node.type.name === name && item.node.attrs.language === "mermaidjs");
  blocks.forEach(block => {
    const existingDecorations = pluginState.decorationSet.find(block.pos, block.pos + block.node.nodeSize, spec => !!spec.diagramId);
    const bestDecoration = findBestOverlapDecoration(existingDecorations, block);
    const renderer = bestDecoration?.spec?.renderer ?? new MermaidRenderer();
    const diagramDecoration = _prosemirrorView.Decoration.widget(block.pos + block.node.nodeSize, () => {
      void renderer.render(block, pluginState.isDark);
      return renderer.element;
    }, {
      diagramId: renderer.diagramId,
      renderer,
      side: -10
    });
    const diagramIdDecoration = _prosemirrorView.Decoration.node(block.pos, block.pos + block.node.nodeSize, {}, {
      diagramId: renderer.diagramId,
      renderer
    });
    decorations.push(diagramDecoration);
    decorations.push(diagramIdDecoration);
  });
  return {
    decorationSet: _prosemirrorView.DecorationSet.create(doc, decorations),
    isDark: pluginState.isDark
  };
}
function Mermaid(_ref2) {
  let {
    name,
    isDark
  } = _ref2;
  return new _prosemirrorState.Plugin({
    key: new _prosemirrorState.PluginKey("mermaid"),
    state: {
      init: (_, _ref3) => {
        let {
          doc
        } = _ref3;
        const pluginState = {
          decorationSet: _prosemirrorView.DecorationSet.create(doc, []),
          isDark
        };
        return getNewState({
          doc,
          name,
          pluginState
        });
      },
      apply: (transaction, pluginState, oldState, state) => {
        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged = transaction.docChanged && [nodeName, previousNodeName].includes(name);
        const themeMeta = transaction.getMeta("theme");
        const mermaidMeta = transaction.getMeta("mermaid");
        const themeToggled = themeMeta?.isDark !== undefined;
        if (themeToggled) {
          pluginState.isDark = themeMeta.isDark;
        }
        if (mermaidMeta || themeToggled || codeBlockChanged || (0, _multiplayer.isRemoteTransaction)(transaction)) {
          return getNewState({
            doc: transaction.doc,
            name,
            pluginState
          });
        }
        return {
          decorationSet: pluginState.decorationSet.map(transaction.mapping, transaction.doc),
          isDark: pluginState.isDark
        };
      }
    },
    view: view => {
      view.dispatch(view.state.tr.setMeta("mermaid", {
        loaded: true
      }));
      return {};
    },
    props: {
      decorations(state) {
        return this.getState(state)?.decorationSet;
      },
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target;
          const diagram = target?.closest(".mermaid-diagram-wrapper");
          const codeBlock = diagram?.previousElementSibling;
          if (!codeBlock) {
            return false;
          }
          const pos = view.posAtDOM(codeBlock, 0);
          if (!pos) {
            return false;
          }

          // select node
          if (diagram && event.detail === 1) {
            view.dispatch(view.state.tr.setSelection(_prosemirrorState.TextSelection.near(view.state.doc.resolve(pos))).scrollIntoView());
            return true;
          }
          return false;
        },
        keydown: (view, event) => {
          switch (event.key) {
            case "ArrowDown":
              {
                const {
                  selection
                } = view.state;
                const $pos = view.state.doc.resolve(Math.min(selection.from + 1, view.state.doc.nodeSize));
                const nextBlock = $pos.nodeAfter;
                if (nextBlock && (0, _isCode.isCode)(nextBlock) && nextBlock.attrs.language === "mermaidjs") {
                  view.dispatch(view.state.tr.setSelection(_prosemirrorState.TextSelection.near(view.state.doc.resolve(selection.to + 1))).scrollIntoView());
                  event.preventDefault();
                  return true;
                }
                return false;
              }
            case "ArrowUp":
              {
                const {
                  selection
                } = view.state;
                const $pos = view.state.doc.resolve(Math.max(0, selection.from - 1));
                const prevBlock = $pos.nodeBefore;
                if (prevBlock && (0, _isCode.isCode)(prevBlock) && prevBlock.attrs.language === "mermaidjs") {
                  view.dispatch(view.state.tr.setSelection(_prosemirrorState.TextSelection.near(view.state.doc.resolve(selection.from - 2))).scrollIntoView());
                  event.preventDefault();
                  return true;
                }
                return false;
              }
          }
          return false;
        }
      }
    }
  });
}