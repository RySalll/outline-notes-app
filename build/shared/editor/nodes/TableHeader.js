"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _table = require("../commands/table");
var _table2 = require("../lib/table");
var _table3 = require("../queries/table");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _utils = require("../styles/utils");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class TableHeader extends _Node.default {
  get name() {
    return "th";
  }
  get schema() {
    return {
      content: "block+",
      tableRole: "header_cell",
      isolating: true,
      parseDOM: [{
        tag: "th",
        getAttrs: _table2.getCellAttrs
      }],
      toDOM(node) {
        return ["th", (0, _table2.setCellAttrs)(node), 0];
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
      block: "th",
      getAttrs: tok => ({
        alignment: tok.info
      })
    };
  }
  get plugins() {
    function buildAddColumnDecoration(pos, index) {
      const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableAddColumn, {
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
        handleDOMEvents: {
          mousedown: (view, event) => {
            if (!(event.target instanceof HTMLElement)) {
              return false;
            }
            const targetAddColumn = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableAddColumn}`);
            if (targetAddColumn) {
              event.preventDefault();
              event.stopImmediatePropagation();
              const index = Number(targetAddColumn.getAttribute("data-index"));
              (0, _table.addColumnBefore)({
                index
              })(view.state, view.dispatch);
              return true;
            }
            const targetGripColumn = event.target.closest(`.${_EditorStyleHelper.EditorStyleHelper.tableGripColumn}`);
            if (targetGripColumn) {
              event.preventDefault();
              event.stopImmediatePropagation();
              (0, _table.selectColumn)(Number(targetGripColumn.getAttribute("data-index")), event.metaKey || event.shiftKey)(view.state, view.dispatch);
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
          const cols = (0, _table3.getCellsInRow)(0)(state);
          if (cols) {
            cols.forEach((pos, index) => {
              const className = (0, _utils.cn)(_EditorStyleHelper.EditorStyleHelper.tableGripColumn, {
                selected: (0, _table3.isColumnSelected)(index)(state),
                first: index === 0,
                last: index === cols.length - 1
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
                decorations.push(buildAddColumnDecoration(pos, index));
              }
              decorations.push(buildAddColumnDecoration(pos, index + 1));
            });
          }
          return _prosemirrorView.DecorationSet.create(doc, decorations);
        }
      }
    })];
  }
}
exports.default = TableHeader;