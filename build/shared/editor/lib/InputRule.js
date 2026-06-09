"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputRule = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _isInCode = require("../queries/isInCode");
/**
 * A factory function for creating Prosemirror input rules that automatically insert text
 * that matches a given regular expression unless the selection is inside a code block or code mark.
 */
class InputRule extends _prosemirrorInputrules.InputRule {
  constructor(rule, insert) {
    super(rule, (state, match, start, end) => {
      if ((0, _isInCode.isInCode)(state)) {
        return null;
      }
      if (match[1]) {
        const offset = match[0].lastIndexOf(match[1]);
        insert += match[0].slice(offset + match[1].length);
        start += offset;
        const cutOff = start - end;
        if (cutOff > 0) {
          insert = match[0].slice(offset - cutOff, offset) + insert;
          start = end;
        }
      }
      return state.tr.insertText(insert, start, end);
    });
  }
}
exports.InputRule = InputRule;