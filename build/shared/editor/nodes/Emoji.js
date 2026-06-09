"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
var _emoji = require("../lib/emoji");
var _emoji2 = _interopRequireDefault(require("../rules/emoji"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Emoji extends _Extension.default {
  get type() {
    return "node";
  }
  get name() {
    return "emoji";
  }
  get schema() {
    return {
      attrs: {
        "data-name": {
          default: "grey_question",
          validate: "string"
        }
      },
      inline: true,
      content: "text*",
      marks: "",
      group: "inline",
      selectable: false,
      parseDOM: [{
        tag: "strong.emoji",
        preserveWhitespace: "full",
        getAttrs: dom => dom.dataset.name ? {
          "data-name": dom.dataset.name
        } : false
      }],
      toDOM: node => {
        const name = node.attrs["data-name"];
        return ["strong", {
          class: `emoji ${name}`,
          "data-name": name
        }, (0, _emoji.getEmojiFromName)(name)];
      },
      toPlainText: node => (0, _emoji.getEmojiFromName)(node.attrs["data-name"])
    };
  }
  get rulePlugins() {
    return [_emoji2.default];
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
    const name = node.attrs["data-name"];
    if (name) {
      state.write(`:${name}:`);
    }
  }
  parseMarkdown() {
    return {
      node: "emoji",
      getAttrs: tok => ({
        "data-name": tok.markup.trim()
      })
    };
  }
}
exports.default = Emoji;