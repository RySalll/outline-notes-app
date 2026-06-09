"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FixTablesPlugin = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
var _changedDescendants = require("../lib/changedDescendants");
var _table = require("../queries/table");
/**
 * A ProseMirror plugin that fixes the last column in a table to ensure it fills the remaining width.
 */
class FixTablesPlugin extends _prosemirrorState.Plugin {
  constructor() {
    super({
      appendTransaction: (_transactions, oldState, state) => {
        let tr;
        const check = node => {
          if (node.type.spec.tableRole === "table") {
            tr = this.fixTable(state, node, tr);
          }
        };
        if (!oldState) {
          state.doc.descendants(check);
        } else if (oldState.doc !== state.doc) {
          (0, _changedDescendants.changedDescendants)(oldState.doc, state.doc, 0, check);
        }
        return tr;
      }
    });
  }
  fixTable(state, table, tr) {
    let fixed = false;
    const map = _prosemirrorTables.TableMap.get(table);
    if (!tr) {
      tr = state.tr;
    }

    // If the table has only one column, remove the colwidth attribute on all cells
    if (map.width === 1) {
      const cells = (0, _table.getCellsInColumn)(0)(state);
      cells.forEach(pos => {
        const node = state.doc.nodeAt(pos);
        if (node?.attrs.colspan) {
          fixed = true;
          tr = tr.setNodeMarkup(pos, undefined, {
            ...node?.attrs,
            colwidth: null
          });
        }
      });
    }
    return fixed ? tr : undefined;
  }
}
exports.FixTablesPlugin = FixTablesPlugin;