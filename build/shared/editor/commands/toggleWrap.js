"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toggleWrap;
var _prosemirrorCommands = require("prosemirror-commands");
var _isNodeActive = require("../queries/isNodeActive");
function toggleWrap(type, attrs) {
  return (state, dispatch) => {
    const isActive = (0, _isNodeActive.isNodeActive)(type)(state);
    if (isActive) {
      return (0, _prosemirrorCommands.lift)(state, dispatch);
    }
    return (0, _prosemirrorCommands.wrapIn)(type, attrs)(state, dispatch);
  };
}