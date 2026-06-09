"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorState = require("prosemirror-state");
var _uuid = require("uuid");
var _addMark = require("../commands/addMark");
var _collapseSelection = require("../commands/collapseSelection");
var _chainTransactions = require("../lib/chainTransactions");
var _isMarkActive = require("../queries/isMarkActive");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _Mark = _interopRequireDefault(require("./Mark"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Comment extends _Mark.default {
  get name() {
    return "comment";
  }
  get schema() {
    return {
      // Allow multiple comments to overlap
      excludes: "",
      attrs: {
        id: {},
        userId: {},
        resolved: {
          default: false,
          validate: "boolean"
        },
        draft: {
          default: false,
          validate: "boolean"
        }
      },
      inclusive: false,
      parseDOM: [{
        tag: `.${_EditorStyleHelper.EditorStyleHelper.comment}`,
        getAttrs: dom => {
          // Ignore comment markers from other documents
          const documentId = dom.getAttribute("data-document-id");
          if (documentId && documentId !== this.editor?.props.id) {
            return false;
          }
          return {
            id: dom.getAttribute("id")?.replace("comment-", ""),
            userId: dom.getAttribute("data-user-id"),
            resolved: !!dom.getAttribute("data-resolved"),
            draft: !!dom.getAttribute("data-draft")
          };
        }
      }],
      toDOM: node => ["span", {
        class: _EditorStyleHelper.EditorStyleHelper.comment,
        id: `comment-${node.attrs.id}`,
        "data-resolved": node.attrs.resolved ? "true" : undefined,
        "data-draft": node.attrs.draft ? "true" : undefined,
        "data-user-id": node.attrs.userId,
        "data-document-id": this.editor?.props.id
      }]
    };
  }
  get allowInReadOnly() {
    return true;
  }
  keys(_ref) {
    let {
      type
    } = _ref;
    return this.options.onCreateCommentMark ? {
      "Mod-Alt-m": (state, dispatch) => {
        if ((0, _isMarkActive.isMarkActive)(state.schema.marks.comment, {
          resolved: false
        })(state)) {
          return false;
        }
        (0, _chainTransactions.chainTransactions)((0, _prosemirrorCommands.toggleMark)(type, {
          id: (0, _uuid.v4)(),
          userId: this.options.userId,
          draft: true
        }), (0, _collapseSelection.collapseSelection)())(state, dispatch);
        return true;
      }
    } : {};
  }
  commands(_ref2) {
    let {
      type
    } = _ref2;
    return this.options.onCreateCommentMark ? () => (state, dispatch) => {
      if ((0, _isMarkActive.isMarkActive)(state.schema.marks.comment, {
        resolved: false
      }, {
        exact: true
      })(state)) {
        return false;
      }
      (0, _chainTransactions.chainTransactions)((0, _addMark.addMark)(type, {
        id: (0, _uuid.v4)(),
        userId: this.options.userId,
        draft: true
      }), (0, _collapseSelection.collapseSelection)())(state, dispatch);
      return true;
    } : undefined;
  }
  toMarkdown() {
    return {
      open: "",
      close: "",
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      appendTransaction(transactions, oldState, newState) {
        if (!transactions.some(transaction => transaction.getMeta("uiEvent") === "paste")) {
          return;
        }

        // Record existing comment marks
        const existingComments = [];
        oldState.doc.descendants(node => {
          node.marks.forEach(mark => {
            if (mark.type.name === "comment") {
              existingComments.push(mark);
            }
          });
          return true;
        });

        // Remove comment marks that are new duplicates of existing ones. This allows us to cut
        // and paste a comment mark, but not copy and paste.
        let tr = newState.tr;
        newState.doc.descendants((node, pos) => {
          node.marks.forEach(mark => {
            if (mark.type.name === "comment" && existingComments.find(m => m.attrs.id === mark.attrs.id) && !existingComments.find(m => m === mark)) {
              tr = tr.removeMark(pos, pos + node.nodeSize, mark.type);
            }
          });
          return true;
        });
        return tr;
      },
      props: {
        handleDOMEvents: {
          mouseup: (_view, event) => {
            if (!(event.target instanceof HTMLElement)) {
              return false;
            }
            const comment = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.comment}`);
            if (!comment) {
              return false;
            }
            const commentId = comment.id.replace("comment-", "");
            const resolved = comment.getAttribute("data-resolved");
            const draftByUser = comment.getAttribute("data-draft") && comment.getAttribute("data-user-id") === this.options.userId;
            if (commentId && !resolved || draftByUser) {
              this.options?.onClickCommentMark?.(commentId);
            }
            return false;
          }
        }
      }
    })];
  }
}
exports.default = Comment;