"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addColumnBefore = addColumnBefore;
exports.addRowAndMoveSelection = addRowAndMoveSelection;
exports.addRowBefore = addRowBefore;
exports.createTable = createTable;
exports.deleteColSelection = deleteColSelection;
exports.deleteRowSelection = deleteRowSelection;
exports.exportTable = exportTable;
exports.selectColumn = selectColumn;
exports.selectRow = selectRow;
exports.selectTable = selectTable;
exports.setColumnAttr = setColumnAttr;
exports.setTableAttr = setTableAttr;
exports.sortTable = sortTable;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
var _ProsemirrorHelper = require("../../utils/ProsemirrorHelper");
var _chainTransactions = require("../lib/chainTransactions");
var _table = require("../queries/table");
var _collapseSelection = require("./collapseSelection");
function createTable(_ref) {
  let {
    rowsCount,
    colsCount,
    colWidth
  } = _ref;
  return (state, dispatch) => {
    if (dispatch) {
      const offset = state.tr.selection.anchor + 1;
      const nodes = createTableInner(state, rowsCount, colsCount, colWidth);
      const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
      const resolvedPos = tr.doc.resolve(offset);
      tr.setSelection(_prosemirrorState.TextSelection.near(resolvedPos));
      dispatch(tr);
    }
    return true;
  };
}
function createTableInner(state, rowsCount, colsCount, colWidth) {
  let withHeaderRow = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  let cellContent = arguments.length > 5 ? arguments[5] : undefined;
  const types = (0, _prosemirrorTables.tableNodeTypes)(state.schema);
  const headerCells = [];
  const cells = [];
  const rows = [];
  const createCell = (cellType, attrs) => cellContent ? cellType.createChecked(attrs, cellContent) : cellType.createAndFill(attrs);
  for (let index = 0; index < colsCount; index += 1) {
    const attrs = colWidth ? {
      colwidth: [colWidth],
      colspan: 1,
      rowspan: 1
    } : null;
    const cell = createCell(types.cell, attrs);
    if (cell) {
      cells.push(cell);
    }
    if (withHeaderRow) {
      const headerCell = createCell(types.header_cell, attrs);
      if (headerCell) {
        headerCells.push(headerCell);
      }
    }
  }
  for (let index = 0; index < rowsCount; index += 1) {
    rows.push(types.row.createChecked(null, withHeaderRow && index === 0 ? headerCells : cells));
  }
  return types.table.createChecked(null, rows);
}
function exportTable(_ref2) {
  let {
    fileName
  } = _ref2;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const table = [];
      for (let r = 0; r < rect.map.height; r++) {
        const cells = [];
        for (let c = 0; c < rect.map.width; c++) {
          const cell = state.doc.nodeAt(rect.tableStart + rect.map.map[r * rect.map.width + c]);
          if (cell) {
            cells.push(cell);
          }
        }
        table.push(cells);
      }
      const csv = table.map(row => row.map(cell => {
        let value = _ProsemirrorHelper.ProsemirrorHelper.toPlainText(cell, state.schema);

        // Escape double quotes by doubling them
        if (value.includes('"')) {
          value = value.replace(new RegExp('"', "g"), '""');
        }

        // Avoid cell content being interpreted as formulas by adding a leading single quote
        value = value.trimStart().replace(/^([+\-=@])/, "'$1");
        return `"${value}"`;
      }).join(",")).join("\n");
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
    return true;
  };
}
function sortTable(_ref3) {
  let {
    index,
    direction
  } = _ref3;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const table = [];
      for (let r = 0; r < rect.map.height; r++) {
        const cells = [];
        for (let c = 0; c < rect.map.width; c++) {
          const cell = state.doc.nodeAt(rect.tableStart + rect.map.map[r * rect.map.width + c]);
          if (cell) {
            cells.push(cell);
          }
        }
        table.push(cells);
      }

      // check if all the cells in the column are a number
      const compareAsText = table.some(row => {
        const cell = row[index]?.textContent;
        return cell === "" ? false : isNaN(parseFloat(cell));
      });
      const hasHeaderRow = table[0].every(cell => cell.type === state.schema.nodes.th);

      // remove the header row
      const header = hasHeaderRow ? table.shift() : undefined;

      // column data before sort
      const columnData = table.map(row => row[index]?.textContent ?? "");

      // sort table data based on column at index
      table.sort((a, b) => {
        if (compareAsText) {
          return (a[index]?.textContent ?? "").localeCompare(b[index]?.textContent ?? "");
        } else {
          return parseFloat(a[index]?.textContent ?? "") - parseFloat(b[index]?.textContent ?? "");
        }
      });
      if (direction === "desc") {
        table.reverse();
      }

      // check if column data changed, if not then do not replace table
      if (columnData.join() === table.map(row => row[index]?.textContent).join()) {
        return true;
      }

      // add the header row back
      if (header) {
        table.unshift(header);
      }

      // create the new table
      const rows = [];
      for (let i = 0; i < table.length; i += 1) {
        rows.push(state.schema.nodes.tr.createChecked(null, table[i]));
      }

      // replace the original table with this sorted one
      const nodes = state.schema.nodes.table.createChecked(rect.table.attrs, rows);
      const {
        tr
      } = state;
      tr.replaceRangeWith(rect.tableStart - 1, rect.tableStart - 1 + rect.table.nodeSize, nodes);
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/**
 * A command that safely adds a row taking into account any existing heading column at the top of
 * the table, and preventing it moving "into" the table.
 *
 * @param index The index to add the row at, if undefined the current selection is used
 * @returns The command
 */
function addRowBefore(_ref4) {
  let {
    index
  } = _ref4;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const isHeaderRowEnabled = (0, _table.isHeaderEnabled)(state, "row", rect);
    const position = index !== undefined ? index : rect.left;

    // Special case when adding row to the beginning of the table to ensure the header does not
    // move inwards.
    const headerSpecialCase = position === 0 && isHeaderRowEnabled;
    (0, _chainTransactions.chainTransactions)(headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("row") : undefined, (s, d) => !!d?.((0, _prosemirrorTables.addRow)(s.tr, rect, position)), headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("row") : undefined, (0, _collapseSelection.collapseSelection)())(state, dispatch);
    return true;
  };
}

/**
 * A command that deletes the current selected row, if any.
 *
 * @returns The command
 */
function deleteRowSelection() {
  return (state, dispatch) => {
    if (state.selection instanceof _prosemirrorTables.CellSelection && state.selection.isRowSelection()) {
      return (0, _prosemirrorTables.deleteRow)(state, dispatch);
    }
    return false;
  };
}

/**
 * A command that deletes the current selected column, if any.
 *
 * @returns The command
 */
function deleteColSelection() {
  return (state, dispatch) => {
    if (state.selection instanceof _prosemirrorTables.CellSelection && state.selection.isColSelection()) {
      return (0, _prosemirrorTables.deleteColumn)(state, dispatch);
    }
    return false;
  };
}

/**
 * A command that safely adds a column taking into account any existing heading column on the far
 * left of the table, and preventing it moving "into" the table.
 *
 * @param index The index to add the column at, if undefined the current selection is used
 * @returns The command
 */
function addColumnBefore(_ref5) {
  let {
    index
  } = _ref5;
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const isHeaderColumnEnabled = (0, _table.isHeaderEnabled)(state, "column", rect);
    const position = index !== undefined ? index : rect.left;

    // Special case when adding column to the beginning of the table to ensure the header does not
    // move inwards.
    const headerSpecialCase = position === 0 && isHeaderColumnEnabled;
    (0, _chainTransactions.chainTransactions)(headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("column") : undefined, (s, d) => !!d?.((0, _prosemirrorTables.addColumn)(s.tr, rect, position)), headerSpecialCase ? (0, _prosemirrorTables.toggleHeader)("column") : undefined, (0, _collapseSelection.collapseSelection)())(state, dispatch);
    return true;
  };
}
function addRowAndMoveSelection() {
  let {
    index
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (state, dispatch, view) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    const rect = (0, _prosemirrorTables.selectedRect)(state);
    const cells = (0, _table.getCellsInColumn)(0)(state);

    // If the cursor is at the beginning of the first column then insert row
    // above instead of below.
    if (rect.left === 0 && view?.endOfTextblock("backward", state)) {
      const indexBefore = index !== undefined ? index - 1 : rect.top;
      dispatch?.((0, _prosemirrorTables.addRow)(state.tr, rect, indexBefore));
      return true;
    }
    const indexAfter = index !== undefined ? index + 1 : rect.bottom;
    const tr = (0, _prosemirrorTables.addRow)(state.tr, rect, indexAfter);

    // Special case when adding row to the end of the table as the calculated
    // rect does not include the row that we just added.
    if (indexAfter !== rect.map.height) {
      const pos = cells[Math.min(cells.length - 1, indexAfter)];
      const $pos = tr.doc.resolve(pos);
      dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near($pos)));
    } else {
      const $pos = tr.doc.resolve(rect.tableStart + rect.table.nodeSize);
      dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near($pos)));
    }
    return true;
  };
}

/**
 * Set column attributes. Passed attributes will be merged with existing.
 *
 * @param attrs The attributes to set
 * @returns The command
 */
function setColumnAttr(_ref6) {
  let {
    index,
    alignment
  } = _ref6;
  return (state, dispatch) => {
    if (dispatch) {
      const cells = (0, _table.getCellsInColumn)(index)(state) || [];
      let transaction = state.tr;
      cells.forEach(pos => {
        const node = state.doc.nodeAt(pos);
        transaction = transaction.setNodeMarkup(pos, undefined, {
          ...node?.attrs,
          alignment
        });
      });
      dispatch(transaction);
    }
    return true;
  };
}

/**
 * Set table attributes. Passed attributes will be merged with existing.
 *
 * @param attrs The attributes to set
 * @returns The command
 */
function setTableAttr(attrs) {
  return (state, dispatch) => {
    if (!(0, _prosemirrorTables.isInTable)(state)) {
      return false;
    }
    if (dispatch) {
      const {
        tr
      } = state;
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      tr.setNodeMarkup(rect.tableStart - 1, undefined, {
        ...rect.table.attrs,
        ...attrs
      }).setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(rect.tableStart)));
      dispatch(tr);
      return true;
    }
    return false;
  };
}
function selectRow(index) {
  let expand = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return (state, dispatch) => {
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const pos = rect.map.positionAt(index, 0, rect.table);
      const $pos = state.doc.resolve(rect.tableStart + pos);
      const rowSelection = expand && state.selection instanceof _prosemirrorTables.CellSelection ? _prosemirrorTables.CellSelection.rowSelection(state.selection.$anchorCell, $pos) : _prosemirrorTables.CellSelection.rowSelection($pos);
      dispatch(state.tr.setSelection(rowSelection));
      return true;
    }
    return false;
  };
}
function selectColumn(index) {
  let expand = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return (state, dispatch) => {
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const pos = rect.map.positionAt(0, index, rect.table);
      const $pos = state.doc.resolve(rect.tableStart + pos);
      const colSelection = expand && state.selection instanceof _prosemirrorTables.CellSelection ? _prosemirrorTables.CellSelection.colSelection(state.selection.$anchorCell, $pos) : _prosemirrorTables.CellSelection.colSelection($pos);
      dispatch(state.tr.setSelection(colSelection));
      return true;
    }
    return false;
  };
}
function selectTable() {
  return (state, dispatch) => {
    if (dispatch) {
      const rect = (0, _prosemirrorTables.selectedRect)(state);
      const map = rect.map.map;
      const $anchor = state.doc.resolve(rect.tableStart + map[0]);
      const $head = state.doc.resolve(rect.tableStart + map[map.length - 1]);
      const tableSelection = new _prosemirrorTables.CellSelection($anchor, $head);
      dispatch(state.tr.setSelection(tableSelection));
      return true;
    }
    return false;
  };
}