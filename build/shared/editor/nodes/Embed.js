"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _urls = require("../../utils/urls");
var _Embed2 = _interopRequireDefault(require("../components/Embed"));
var _embeds = _interopRequireDefault(require("../embeds"));
var _embeds2 = require("../lib/embeds");
var _embeds3 = _interopRequireDefault(require("../rules/embeds"));
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Embed extends _Node.default {
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
    _defineProperty(this, "component", props => {
      const {
        embeds,
        embedsDisabled
      } = this.editor.props;
      return /*#__PURE__*/React.createElement(_Embed2.default, _extends({}, props, {
        embeds: embeds,
        embedsDisabled: embedsDisabled,
        onChangeSize: this.handleChangeSize(props)
      }));
    });
  }
  get name() {
    return "embed";
  }
  get schema() {
    return {
      content: "inline*",
      group: "block",
      atom: true,
      attrs: {
        href: {
          validate: "string"
        },
        width: {
          default: null
        },
        height: {
          default: null
        }
      },
      parseDOM: [{
        tag: "iframe",
        getAttrs: dom => {
          const embeds = this.editor?.props.embeds ?? _embeds.default;
          const href = dom.getAttribute("data-canonical-url") || "";
          const response = (0, _embeds2.getMatchingEmbed)(embeds, href);
          if (response) {
            return {
              href
            };
          }
          return false;
        }
      }, {
        tag: "a.embed",
        getAttrs: dom => ({
          href: dom.getAttribute("href")
        })
      }],
      toDOM: node => {
        const embeds = this.editor?.props.embeds ?? _embeds.default;
        const response = (0, _embeds2.getMatchingEmbed)(embeds, node.attrs.href);
        const src = response?.embed.transformMatch?.(response.matches);
        if (src) {
          return ["iframe", {
            class: "embed",
            frameborder: "0",
            src: (0, _urls.sanitizeUrl)(src),
            contentEditable: "false",
            allowfullscreen: "true",
            "data-canonical-url": (0, _urls.sanitizeUrl)(node.attrs.href)
          }];
        } else {
          return ["a", {
            class: "embed",
            href: (0, _urls.sanitizeUrl)(node.attrs.href),
            contentEditable: "false",
            "data-canonical-url": (0, _urls.sanitizeUrl)(node.attrs.href)
          }, response?.embed.title ?? node.attrs.href];
        }
      },
      toPlainText: node => node.attrs.href
    };
  }
  get rulePlugins() {
    return [(0, _embeds3.default)(this.options.embeds)];
  }
  commands(_ref3) {
    let {
      type
    } = _ref3;
    return attrs => (state, dispatch) => {
      dispatch?.(state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView());
      return true;
    };
  }
  toMarkdown(state, node) {
    if (!state.inTable) {
      state.ensureNewLine();
    }
    const href = node.attrs.href.replace(/_/g, "%5F");
    state.write("[" + state.esc(href, false) + "](" + state.esc(href, false) + ")");
    if (!state.inTable) {
      state.write("\n\n");
    }
  }
  parseMarkdown() {
    return {
      node: "embed",
      getAttrs: token => ({
        href: token.attrGet("href")
      })
    };
  }
}
exports.default = Embed;