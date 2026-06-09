"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _getMarkRange = require("../queries/getMarkRange");
var _mark = _interopRequireDefault(require("../rules/mark"));
var _Mark = _interopRequireDefault(require("./Mark"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Placeholder extends _Mark.default {
  get name() {
    return "placeholder";
  }
  get schema() {
    return {
      parseDOM: [{
        tag: "span.template-placeholder"
      }],
      toDOM: () => ["span", {
        class: "template-placeholder"
      }],
      toPlainText: () => ""
    };
  }
  get rulePlugins() {
    return [(0, _mark.default)({
      delim: "!!",
      mark: "placeholder"
    })];
  }
  toMarkdown() {
    return {
      open: "!!",
      close: "!!",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
  parseMarkdown() {
    return {
      mark: "placeholder"
    };
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      props: {
        handleDOMEvents: {
          paste: view => {
            if (this.editor.props.template || !view.editable) {
              return false;
            }
            const {
              dispatch
            } = view;
            const {
              schema,
              tr,
              doc,
              selection
            } = view.state;
            const range = (0, _getMarkRange.getMarkRange)(selection.$to, schema.marks.placeholder) || (0, _getMarkRange.getMarkRange)(doc.resolve(Math.max(0, selection.from - 1)), schema.marks.placeholder);
            if (range) {
              dispatch(tr.removeMark(range.from, range.to, schema.marks.placeholder).insertText("", range.from, range.to));
            }
            return false;
          },
          mousedown: (view, event) => {
            if (this.editor.props.template || !view.editable) {
              return false;
            }
            const {
              state,
              dispatch
            } = view;
            const {
              schema,
              doc
            } = view.state;
            const pos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY
            });
            if (!pos) {
              return false;
            }
            const range = (0, _getMarkRange.getMarkRange)(doc.resolve(pos.pos), schema.marks.placeholder) || (0, _getMarkRange.getMarkRange)(doc.resolve(Math.max(0, pos.pos - 1)), schema.marks.placeholder);
            if (!range) {
              return false;
            }
            event.stopPropagation();
            event.preventDefault();
            const startOfMark = state.doc.resolve(range.from);
            dispatch(state.tr.setSelection(_prosemirrorState.TextSelection.near(startOfMark)).scrollIntoView());

            // Because we're preventing default, we need to focus the editor
            view.focus();
            return true;
          }
        },
        handleTextInput: (view, from, to, text) => {
          if (this.editor.props.template) {
            return false;
          }
          const {
            state,
            dispatch
          } = view;
          const $from = state.doc.resolve(from);
          const range = (0, _getMarkRange.getMarkRange)($from, state.schema.marks.placeholder);
          if (!range) {
            return false;
          }
          const selectionStart = Math.min(from, range.from);
          const selectionEnd = Math.max(to, range.to);
          dispatch(state.tr.removeMark(range.from, range.to, state.schema.marks.placeholder).insertText(text, selectionStart, selectionEnd));
          const $to = view.state.doc.resolve(selectionStart + text.length);
          dispatch(view.state.tr.setSelection(_prosemirrorState.TextSelection.near($to)));
          return true;
        },
        handleKeyDown: (view, event) => {
          if (this.editor.props.template || !view.editable) {
            return false;
          }
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Backspace") {
            return false;
          }
          const {
            state,
            dispatch
          } = view;
          if (event.key === "Backspace") {
            const range = (0, _getMarkRange.getMarkRange)(state.doc.resolve(Math.max(0, state.selection.from - 1)), state.schema.marks.placeholder);
            if (!range) {
              return false;
            }
            dispatch(state.tr.removeMark(range.from, range.to, state.schema.marks.placeholder).insertText("", range.from, range.to));
            return true;
          }
          if (event.key === "ArrowLeft") {
            const range = (0, _getMarkRange.getMarkRange)(state.doc.resolve(Math.max(0, state.selection.from - 1)), state.schema.marks.placeholder);
            if (!range) {
              return false;
            }
            const startOfMark = state.doc.resolve(range.from);
            dispatch(state.tr.setSelection(_prosemirrorState.TextSelection.near(startOfMark)));
            return true;
          }
          if (event.key === "ArrowRight") {
            const range = (0, _getMarkRange.getMarkRange)(state.selection.$from, state.schema.marks.placeholder);
            if (!range) {
              return false;
            }
            const endOfMark = state.doc.resolve(range.to);
            dispatch(state.tr.setSelection(_prosemirrorState.TextSelection.near(endOfMark)));
            return true;
          }
          return false;
        }
      }
    })];
  }
}
exports.default = Placeholder;