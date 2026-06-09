"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toggleList;
var _prosemirrorSchemaList = require("prosemirror-schema-list");
var _chainTransactions = require("../lib/chainTransactions");
var _findParentNode = require("../queries/findParentNode");
var _isList = require("../queries/isList");
var _clearNodes = _interopRequireDefault(require("./clearNodes"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function toggleList(listType, itemType) {
  return (state, dispatch) => {
    const {
      schema,
      selection
    } = state;
    const {
      $from,
      $to
    } = selection;
    const range = $from.blockRange($to);
    const {
      tr
    } = state;
    if (!range) {
      return false;
    }
    const parentList = (0, _findParentNode.findParentNode)(node => (0, _isList.isList)(node, schema))(selection);
    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      if (parentList.node.type === listType) {
        return (0, _prosemirrorSchemaList.liftListItem)(itemType)(state, dispatch);
      }
      if ((0, _isList.isList)(parentList.node, schema) && listType.validContent(parentList.node.content)) {
        tr.setNodeMarkup(parentList.pos, listType);
        dispatch?.(tr);
        return false;
      }
    }
    const canWrapInList = (0, _prosemirrorSchemaList.wrapInList)(listType)(state);
    if (canWrapInList) {
      return (0, _prosemirrorSchemaList.wrapInList)(listType)(state, dispatch);
    }
    return (0, _chainTransactions.chainTransactions)((0, _clearNodes.default)(), (0, _prosemirrorSchemaList.wrapInList)(listType))(state, dispatch);
  };
}