"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class MaxLength extends _Extension.default {
  get name() {
    return "maxlength";
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      filterTransaction: tr => {
        if (this.options.maxLength) {
          const result = tr.doc && tr.doc.nodeSize > this.options.maxLength;
          return !result;
        }
        return true;
      }
    })];
  }
}
exports.default = MaxLength;