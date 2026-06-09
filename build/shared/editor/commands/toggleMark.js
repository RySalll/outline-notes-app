"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleMark = toggleMark;
var _prosemirrorCommands = require("prosemirror-commands");
var _chainTransactions = require("../lib/chainTransactions");
var _isMarkActive = require("../queries/isMarkActive");
/**
 * Toggles a mark on the current selection, if the mark is already with
 * matching attributes it will remove the mark instead, if the mark is active
 * but with different attributes it will update the mark with the new attributes.
 *
 * @param type - The mark type to toggle.
 * @param attrs - The attributes to apply to the mark.
 * @returns A prosemirror command.
 */
function toggleMark(type, attrs) {
  return (state, dispatch) => {
    if ((0, _isMarkActive.isMarkActive)(type, attrs)(state)) {
      return (0, _prosemirrorCommands.toggleMark)(type)(state, dispatch);
    }
    if ((0, _isMarkActive.isMarkActive)(type)(state)) {
      return (0, _chainTransactions.chainTransactions)((0, _prosemirrorCommands.toggleMark)(type), (0, _prosemirrorCommands.toggleMark)(type, attrs))(state, dispatch);
    }
    return (0, _prosemirrorCommands.toggleMark)(type, attrs)(state, dispatch);
  };
}