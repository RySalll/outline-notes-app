"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorHistory = require("prosemirror-history");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class History extends _Extension.default {
  get name() {
    return "history";
  }
  commands() {
    return {
      undo: () => _prosemirrorHistory.undo,
      redo: () => _prosemirrorHistory.redo
    };
  }
  keys() {
    return {
      "Mod-z": () => this.editor.commands.undo(),
      "Mod-y": () => this.editor.commands.redo(),
      "Shift-Mod-z": () => this.editor.commands.redo(),
      Backspace: _prosemirrorInputrules.undoInputRule
    };
  }
  get plugins() {
    return [(0, _prosemirrorHistory.history)()];
  }
}
exports.default = History;