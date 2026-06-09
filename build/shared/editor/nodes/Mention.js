"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _uuid = require("uuid");
var _env = _interopRequireDefault(require("../../env"));
var _types = require("../../types");
var _Mentions = require("../components/Mentions");
var _mention = _interopRequireDefault(require("../rules/mention"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Mention extends _Node.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "component", props => {
      switch (props.node.attrs.type) {
        case _types.MentionType.User:
          return /*#__PURE__*/React.createElement(_Mentions.MentionUser, props);
        case _types.MentionType.Document:
          return /*#__PURE__*/React.createElement(_Mentions.MentionDocument, props);
        default:
          return null;
      }
    });
  }
  get name() {
    return "mention";
  }
  get schema() {
    return {
      attrs: {
        type: {
          default: _types.MentionType.User
        },
        label: {},
        modelId: {},
        actorId: {
          default: undefined
        },
        id: {
          default: undefined
        }
      },
      inline: true,
      marks: "",
      group: "inline",
      atom: true,
      parseDOM: [{
        tag: `.${this.name}`,
        preserveWhitespace: "full",
        priority: 100,
        getAttrs: dom => {
          const type = dom.dataset.type;
          const modelId = dom.dataset.id;
          if (!type || !modelId) {
            return false;
          }
          return {
            type,
            modelId,
            actorId: dom.dataset.actorid,
            label: dom.innerText,
            id: dom.id
          };
        }
      }],
      toDOM: node => [node.attrs.type === _types.MentionType.User ? "span" : "a", {
        class: `${node.type.name} use-hover-preview`,
        id: node.attrs.id,
        href: node.attrs.type === _types.MentionType.User ? undefined : `${_env.default.URL}/doc/${node.attrs.modelId}`,
        "data-type": node.attrs.type,
        "data-id": node.attrs.modelId,
        "data-actorid": node.attrs.actorId,
        "data-url": `mention://${node.attrs.id}/${node.attrs.type}/${node.attrs.modelId}`
      }, String(node.attrs.label)],
      toPlainText: node => node.attrs.type === _types.MentionType.User ? `@${node.attrs.label}` : node.attrs.label
    };
  }
  get rulePlugins() {
    return [_mention.default];
  }
  get plugins() {
    return [
    // Ensure mentions have unique IDs
    new _prosemirrorState.Plugin({
      appendTransaction: (_transactions, _oldState, newState) => {
        const tr = newState.tr;
        const existingIds = new Set();
        let modified = false;
        tr.doc.descendants((node, pos) => {
          let nodeId = node.attrs.id;
          if (node.type.name === this.name && (!nodeId || existingIds.has(nodeId))) {
            nodeId = (0, _uuid.v4)();
            modified = true;
            tr.setNodeAttribute(pos, "id", nodeId);
          }
          existingIds.add(nodeId);
        });
        if (modified) {
          return tr;
        }
        return null;
      }
    })];
  }
  keys() {
    return {
      Enter: state => {
        const {
          selection
        } = state;
        if (selection instanceof _prosemirrorState.NodeSelection && selection.node.type.name === this.name && selection.node.attrs.type === _types.MentionType.Document) {
          const {
            modelId
          } = selection.node.attrs;
          this.editor.props.onClickLink?.(`/doc/${modelId}`);
          return true;
        }
        return false;
      }
    };
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return attrs => (state, dispatch) => {
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
    };
  }
  toMarkdown(state, node) {
    const mType = node.attrs.type;
    const mId = node.attrs.modelId;
    const label = node.attrs.label;
    const id = node.attrs.id;
    state.write(`@[${label}](mention://${id}/${mType}/${mId})`);
  }
  parseMarkdown() {
    return {
      node: "mention",
      getAttrs: tok => ({
        id: tok.attrGet("id"),
        type: tok.attrGet("type"),
        modelId: tok.attrGet("modelId"),
        label: tok.content
      })
    };
  }
}
exports.default = Mention;