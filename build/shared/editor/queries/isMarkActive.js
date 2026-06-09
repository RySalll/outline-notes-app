"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMarkActive = void 0;
var _getMarksBetween = require("./getMarksBetween");
/**
 * Checks if a mark is active in the current selection or not.
 *
 * @param type The mark type to check.
 * @param attrs The attributes to check.
 * @param options The options to use.
 * @returns A function that checks if a mark is active in the current selection or not.
 */
const isMarkActive = (type, attrs, options) => state => {
  if (!type) {
    return false;
  }
  const {
    from,
    $from,
    to,
    empty
  } = state.selection;
  const hasMark = !!(empty ? type.isInSet(state.storedMarks || $from.marks()) : state.doc.rangeHasMark(from, to, type));
  if (!hasMark) {
    return false;
  }
  if (attrs || options) {
    const results = (0, _getMarksBetween.getMarksBetween)(from, to, state);
    return results.some(_ref => {
      let {
        mark,
        start,
        end
      } = _ref;
      return mark.type === type && (!attrs || Object.keys(attrs).every(key => mark.attrs[key] === attrs[key])) && (!options?.exact || start === from && end === to);
    });
  }
  return true;
};
exports.isMarkActive = isMarkActive;