"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _sonner = require("sonner");
var _urls = require("../../utils/urls");
var _getMarkRange = require("../queries/getMarkRange");
var _isMarkActive = require("../queries/isMarkActive");
var _Mark = _interopRequireDefault(require("./Mark"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LINK_INPUT_REGEX = /\[([^[]+)]\((\S+)\)$/;
function isPlainURL(link, parent, index, side) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) {
    return false;
  }
  const content = parent.child(index + (side < 0 ? -1 : 0));
  if (!content.isText || content.text !== link.attrs.href || content.marks[content.marks.length - 1] !== link) {
    return false;
  }
  if (index === (side < 0 ? 1 : parent.childCount - 1)) {
    return true;
  }
  const next = parent.child(index + (side < 0 ? -2 : 1));
  return !link.isInSet(next.marks);
}
class Link extends _Mark.default {
  get name() {
    return "link";
  }
  get schema() {
    return {
      attrs: {
        href: {
          default: "",
          validate: "string"
        },
        title: {
          default: null,
          validate: "string|null"
        }
      },
      inclusive: false,
      parseDOM: [{
        tag: "a[href]:not(.embed)",
        getAttrs: dom => ({
          href: dom.getAttribute("href"),
          title: dom.getAttribute("title")
        })
      }],
      toDOM: node => ["a", {
        title: node.attrs.title,
        href: (0, _urls.sanitizeUrl)(node.attrs.href),
        class: "use-hover-preview",
        rel: "noopener noreferrer nofollow"
      }, 0]
    };
  }
  inputRules(_ref) {
    let {
      type
    } = _ref;
    return [new _prosemirrorInputrules.InputRule(LINK_INPUT_REGEX, (state, match, start, end) => {
      const [okay, alt, href] = match;
      const {
        tr
      } = state;
      if (okay) {
        tr.replaceWith(start, end, this.editor.schema.text(alt)).addMark(start, start + alt.length, type.create({
          href
        }));
      }
      return tr;
    })];
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      "Mod-k": (state, dispatch) => {
        if (state.selection.empty) {
          return false;
        }
        return (0, _prosemirrorCommands.toggleMark)(type, {
          href: ""
        })(state, dispatch);
      },
      "Mod-Enter": state => {
        if ((0, _isMarkActive.isMarkActive)(type)(state)) {
          const range = (0, _getMarkRange.getMarkRange)(state.selection.$from, state.schema.marks.link);
          if (range && range.mark && this.options.onClickLink) {
            try {
              const event = new KeyboardEvent("keydown", {
                metaKey: false
              });
              this.options.onClickLink((0, _urls.sanitizeUrl)(range.mark.attrs.href), event);
            } catch (err) {
              _sonner.toast.error(this.options.dictionary.openLinkError);
            }
            return true;
          }
        }
        return false;
      }
    };
  }
  get plugins() {
    const handleClick = (view, pos) => {
      const {
        doc,
        tr
      } = view.state;
      const range = (0, _getMarkRange.getMarkRange)(doc.resolve(pos), this.editor.schema.marks.link);
      if (!range || range.from === pos || range.to === pos) {
        return false;
      }
      try {
        const $start = doc.resolve(range.from);
        const $end = doc.resolve(range.to);
        tr.setSelection(new _prosemirrorState.TextSelection($start, $end));
        view.dispatch(tr);
        return true;
      } catch (err) {
        // Failed to set selection
      }
      return false;
    };
    const plugin = new _prosemirrorState.Plugin({
      props: {
        decorations: state => plugin.getState(state),
        handleDOMEvents: {
          contextmenu: (view, event) => {
            const result = view.posAtCoords({
              left: event.clientX,
              top: event.clientY
            });
            if (result) {
              return handleClick(view, result.pos);
            }
            return false;
          },
          mousedown: (view, event) => {
            const target = event.target?.closest("a");
            if (!(target instanceof HTMLAnchorElement) || event.button !== 0) {
              return false;
            }
            if (target.role === "button" || target.matches(".component-attachment *")) {
              return false;
            }

            // clicking a link while editing should show the link toolbar,
            // clicking in read-only will navigate
            if (!view.editable || view.editable && !view.hasFocus()) {
              const href = target.href || (target.parentNode instanceof HTMLAnchorElement ? target.parentNode.href : "");
              try {
                if (this.options.onClickLink) {
                  event.stopPropagation();
                  event.preventDefault();
                  this.options.onClickLink((0, _urls.sanitizeUrl)(href), event);
                }
              } catch (err) {
                _sonner.toast.error(this.options.dictionary.openLinkError);
              }
              return true;
            }
            const result = view.posAtCoords({
              left: event.clientX,
              top: event.clientY
            });
            if (result && handleClick(view, result.pos)) {
              event.preventDefault();
              return true;
            }
            return false;
          },
          click: (view, event) => {
            if (!(event.target instanceof HTMLAnchorElement) || event.button !== 0) {
              return false;
            }
            if (event.target.role === "button" || event.target.matches(".component-attachment *")) {
              return false;
            }

            // Prevent all default click behavior of links, see mousedown above
            // for custom link handling.
            if (this.options.onClickLink) {
              event.stopPropagation();
              event.preventDefault();
            }
            return false;
          }
        }
      }
    });
    return [plugin];
  }
  toMarkdown() {
    return {
      open: (_state, mark, parent, index) => isPlainURL(mark, parent, index, 1) ? "<" : "[",
      close: (state, mark, parent, index) => isPlainURL(mark, parent, index, -1) ? ">" : "](" + state.esc(mark.attrs.href) + (mark.attrs.title ? " " + quote(mark.attrs.title) : "") + ")"
    };
  }
  parseMarkdown() {
    return {
      mark: "link",
      getAttrs: token => ({
        href: token.attrGet("href"),
        title: token.attrGet("title") || null
      })
    };
  }
}
exports.default = Link;
function quote(str) {
  const wrap = str.indexOf('"') === -1 ? '""' : str.indexOf("'") === -1 ? "''" : "()";
  return wrap[0] + str + wrap[1];
}