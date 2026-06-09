"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toggleBlockType;
var _prosemirrorCommands = require("prosemirror-commands");
var _isNodeActive = require("../queries/isNodeActive");
/**
 * Toggles the block type of the current selection between the given type and the toggle type.
 *
 * @param type The node type
 * @param toggleType The toggle node type
 * @returns A prosemirror command.
 */
function toggleBlockType(type, toggleType) {
  let attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return (state, dispatch) => {
    const isActive = (0, _isNodeActive.isNodeActive)(type, attrs)(state);
    if (isActive) {
      return (0, _prosemirrorCommands.setBlockType)(toggleType)(state, dispatch);
    }
    return (0, _prosemirrorCommands.setBlockType)(type, attrs)(state, dispatch);
  };
}