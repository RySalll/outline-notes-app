"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCodemark = _interopRequireDefault(require("prosemirror-codemark"));
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorState = require("prosemirror-state");
var _markInputRule = require("../lib/markInputRule");
var _isInCode = require("../queries/isInCode");
var _Mark = _interopRequireDefault(require("./Mark"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Code extends _Mark.default {
  get name() {
    return "code_inline";
  }
  get schema() {
    return {
      excludes: "mention link placeholder highlight em strong",
      parseDOM: [{
        tag: "code.inline",
        preserveWhitespace: true
      }],
      toDOM: () => ["code", {
        class: "inline",
        spellCheck: "false"
      }]
    };
  }
  inputRules(_ref) {
    let {
      type
    } = _ref;
    return [(0, _markInputRule.markInputRuleForPattern)("`", type)];
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      // Note: This key binding only works on non-Mac platforms
      // https://github.com/ProseMirror/prosemirror/issues/515
      "Mod`": (0, _prosemirrorCommands.toggleMark)(type),
      "Mod-e": (0, _prosemirrorCommands.toggleMark)(type),
      "Mod-Shift-c": (0, _prosemirrorCommands.toggleMark)(type)
    };
  }
  get plugins() {
    const codeCursorPlugin = (0, _prosemirrorCodemark.default)({
      markType: this.editor.schema.marks.code_inline
    })[0];
    return [codeCursorPlugin, new _prosemirrorState.Plugin({
      props: {
        // Typing a character inside of two backticks will wrap the character
        // in an inline code mark.
        handleTextInput: (view, from, to, text) => {
          const {
            state
          } = view;

          // Prevent access out of document bounds
          if (from === 0 || to === state.doc.nodeSize - 1 || text === "`") {
            return false;
          }
          if (from === to && state.doc.textBetween(from - 1, from) === "`" && state.doc.textBetween(to, to + 1) === "`") {
            const start = from - 1;
            const end = to + 1;
            view.dispatch(state.tr.delete(start, end).insertText(text, start).addMark(start, start + text.length, state.schema.marks.code_inline.create()));
            return true;
          }
          return false;
        },
        // Pasting a character inside of two backticks will wrap the character
        // in an inline code mark.
        handlePaste: (view, _event, slice) => {
          const {
            state
          } = view;
          const {
            from,
            to
          } = state.selection;

          // Prevent access out of document bounds
          if (from === 0 || to === state.doc.nodeSize - 1) {
            return false;
          }
          const start = from - 1;
          const end = to + 1;
          if (from === to && state.doc.textBetween(start, from) === "`" && state.doc.textBetween(to, end) === "`") {
            view.dispatch(state.tr.replaceRange(start, end, slice).addMark(start, start + slice.size, state.schema.marks.code_inline.create()));
            return true;
          }
          return false;
        },
        // Triple clicking inside of an inline code mark will select the entire
        // code mark.
        handleTripleClickOn: (view, pos) => {
          const {
            state
          } = view;
          const inCodeMark = (0, _isInCode.isInCode)(state, {
            onlyMark: true
          });
          if (inCodeMark) {
            const $pos = state.doc.resolve(pos);
            const before = $pos.nodeBefore?.nodeSize ?? 0;
            const after = $pos.nodeAfter?.nodeSize ?? 0;
            const $from = state.doc.resolve(pos - before);
            const $to = state.doc.resolve(pos + after);
            view.dispatch(state.tr.setSelection(_prosemirrorState.TextSelection.between($from, $to)));
            return true;
          }
          return false;
        }
      }
    })];
  }
  toMarkdown() {
    function backticksFor(node, side) {
      const ticks = /`+/g;
      let match;
      let len = 0;
      if (node.isText) {
        while (match = ticks.exec(node.text || "")) {
          len = Math.max(len, match[0].length);
        }
      }
      let result = len > 0 && side > 0 ? " `" : "`";
      for (let i = 0; i < len; i++) {
        result += "`";
      }
      if (len > 0 && side < 0) {
        result += " ";
      }
      return result;
    }
    return {
      open(_state, _mark, parent, index) {
        return backticksFor(parent.child(index), -1);
      },
      close(_state, _mark, parent, index) {
        return backticksFor(parent.child(index - 1), 1);
      },
      escape: false
    };
  }
  parseMarkdown() {
    return {
      mark: "code_inline"
    };
  }
}
exports.default = Code;