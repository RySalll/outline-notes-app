"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorTables = require("prosemirror-tables");
var _table = require("../commands/table");
var _FixTables = require("../plugins/FixTables");
var _tables = _interopRequireDefault(require("../rules/tables"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _Node = _interopRequireDefault(require("./Node"));
var _TableView = require("./TableView");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Table extends _Node.default {
  get name() {
    return "table";
  }
  get schema() {
    return {
      content: "tr+",
      tableRole: "table",
      isolating: true,
      group: "block",
      parseDOM: [{
        tag: "table"
      }],
      attrs: {
        layout: {
          default: null
        }
      },
      toDOM() {
        // Note: This is overridden by TableView
        return ["div", {
          class: _EditorStyleHelper.EditorStyleHelper.table
        }, ["table", {}, ["tbody", 0]]];
      }
    };
  }
  get rulePlugins() {
    return [_tables.default];
  }
  commands() {
    return {
      createTable: _table.createTable,
      setColumnAttr: _table.setColumnAttr,
      setTableAttr: _table.setTableAttr,
      sortTable: _table.sortTable,
      addColumnBefore: _table.addColumnBefore,
      addColumnAfter: () => _prosemirrorTables.addColumnAfter,
      deleteColumn: () => _prosemirrorTables.deleteColumn,
      addRowBefore: _table.addRowBefore,
      addRowAfter: () => _prosemirrorTables.addRowAfter,
      deleteRow: () => _prosemirrorTables.deleteRow,
      deleteTable: () => _prosemirrorTables.deleteTable,
      exportTable: _table.exportTable,
      toggleHeaderColumn: () => (0, _prosemirrorTables.toggleHeader)("column"),
      toggleHeaderRow: () => (0, _prosemirrorTables.toggleHeader)("row")
    };
  }
  keys() {
    return {
      Tab: (0, _prosemirrorCommands.chainCommands)((0, _prosemirrorTables.goToNextCell)(1), (0, _table.addRowAndMoveSelection)()),
      "Shift-Tab": (0, _prosemirrorTables.goToNextCell)(-1),
      "Mod-Enter": (0, _table.addRowAndMoveSelection)(),
      "Mod-Backspace": (0, _prosemirrorCommands.chainCommands)((0, _table.deleteColSelection)(), (0, _table.deleteRowSelection)())
    };
  }
  toMarkdown(state, node) {
    state.renderTable(node);
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      block: "table"
    };
  }
  get plugins() {
    return [
    // Note: Important to register columnResizing before tableEditing
    (0, _prosemirrorTables.columnResizing)({
      View: _TableView.TableView
    }), (0, _prosemirrorTables.tableEditing)(), new _FixTables.FixTablesPlugin()];
  }
}
exports.default = Table;