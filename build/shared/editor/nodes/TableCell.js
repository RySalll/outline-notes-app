"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _table = require("../commands/table");
var _table2 = require("../lib/table");
var _table3 = require("../queries/table");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _utils = require("../styles/utils");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class TableCell extends _Node.default {
  get name() {
    return "td";
  }
  get schema() {
    return {
      content: "block+",
      tableRole: "cell",
      isolating: true,
      parseDOM: [{
        tag: "td",
        getAttrs: _table2.getCellAttrs
      }],
      toDOM(node) {
        return ["td", (0, _table2.setCellAttrs)(node), 0];
      },
      attrs: {
        colspan: {
          default: 1
        },
        rowspan: {
          default: 1
        },
        alignment: {
          default: null
        },
        colwidth: {
          default: null
        }
      }
    };
  }
  toMarkdown() {
    // see: renderTable
  }
  parseMarkdown() {
    return {
      block: "td",
      getAttrs: tok => ({
        alignment: tok.info
      })
    };
  }
  get plugins() {
    function buildAddRowDecoration(pos, index) {
      const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableAddRow, {
        first: index === 0
      });
      return _prosemirrorView.Decoration.widget(pos + 1, () => {
        const plus = document.createElement("a");
        plus.role = "button";
        plus.className = className;
        plus.dataset.index = index.toString();
        return plus;
      }, {
        key: (0, _utils.cn)(className, index)
      });
    }
    return [new _prosemirrorState.Plugin({
      props: {
        transformCopied: slice => {
          // check if the copied selection is a single table, with a single row, with a single cell. If so,
          // copy the cell content only – not a table with a single cell. This leads to more predictable pasting
          // behavior, both in and outside the app.
          if (slice.content.childCount === 1) {
            const table = slice.content.firstChild;
            if (table?.type.spec.tableRole === "table" && table.childCount === 1) {
              const row = table.firstChild;
              if (row?.type.spec.tableRole === "row" && row.childCount === 1) {
                const cell = row.firstChild;
                if (cell?.type.spec.tableRole === "cell") {
                  return new _prosemirrorModel.Slice(cell.content, slice.openStart, slice.openEnd);
                }
              }
            }
          }
          return slice;
        },
        handleDOMEvents: {
          mousedown: (view, event) => {
            if (!(event.target instanceof HTMLElement)) {
              return false;
            }
            const targetAddRow = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableAddRow}`);
            if (targetAddRow) {
              event.preventDefault();
              event.stopImmediatePropagation();
              const index = Number(targetAddRow.getAttribute("data-index"));
              (0, _table.addRowBefore)({
                index
              })(view.state, view.dispatch);
              return true;
            }
            const targetGrip = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableGrip}`);
            if (targetGrip) {
              event.preventDefault();
              event.stopImmediatePropagation();
              (0, _table.selectTable)()(view.state, view.dispatch);
              return true;
            }
            const targetGripRow = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableGripRow}`);
            if (targetGripRow) {
              event.preventDefault();
              event.stopImmediatePropagation();
              (0, _table.selectRow)(Number(targetGripRow.getAttribute("data-index")), event.metaKey || event.shiftKey)(view.state, view.dispatch);
              return true;
            }
            return false;
          }
        },
        decorations: state => {
          if (!this.editor.view?.editable) {
            return;
          }
          const {
            doc
          } = state;
          const decorations = [];
          const rows = (0, _table3.getCellsInColumn)(0)(state);
          if (rows) {
            rows.forEach((pos, index) => {
              if (index === 0) {
                const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableGrip, {
                  selected: (0, _table3.isTableSelected)(state)
                });
                decorations.push(_prosemirrorView.Decoration.widget(pos + 1, () => {
                  const grip = document.createElement("a");
                  grip.role = "button";
                  grip.className = className;
                  return grip;
                }, {
                  key: className
                }));
              }
              const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableGripRow, {
                selected: (0, _table3.isRowSelected)(index)(state),
                first: index === 0,
                last: index === rows.length - 1
              });
              decorations.push(_prosemirrorView.Decoration.widget(pos + 1, () => {
                const grip = document.createElement("a");
                grip.role = "button";
                grip.className = className;
                grip.dataset.index = index.toString();
                return grip;
              }, {
                key: (0, _utils.cn)(className, index)
              }));
              if (index === 0) {
                decorations.push(buildAddRowDecoration(pos, index));
              }
              decorations.push(buildAddRowDecoration(pos, index + 1));
            });
          }
          return _prosemirrorView.DecorationSet.create(doc, decorations);
        }
      }
    })];
  }
}
exports.default = TableCell;