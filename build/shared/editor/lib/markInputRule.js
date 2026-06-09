"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = markInputRule;
exports.markInputRuleForPattern = markInputRuleForPattern;
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _getMarksBetween = require("../queries/getMarksBetween");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A factory function for creating a Prosemirror InputRule that automatically apply a mark to text
 * that matches a given regular expression.
 *
 * Assumes the mark is not already applied, and that the regex includes two named capture groups:
 * `remove` and `text`. The `remove` group is used to determine what text should be removed from
 * the document before applying the mark, and the `text` group is used to determine what text
 * should be marked.
 *
 * @param regexp The regular expression to match.
 * @param markType The mark type to apply.
 * @param getAttrs An optional function that returns the attributes to apply to the new mark.
 * @returns The input rule
 */
function markInputRule(regexp, markType, getAttrs) {
  return new _prosemirrorInputrules.InputRule(regexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    const {
      tr
    } = state;
    const captureGroup = match.groups?.text ?? match[match.length - 1];
    const removalGroup = match.groups?.remove ?? match[match.length - 2];
    const fullMatch = match[0];
    if (captureGroup) {
      const matchStart = start + fullMatch.lastIndexOf(removalGroup);
      const textStart = start + fullMatch.lastIndexOf(captureGroup);
      const textEnd = textStart + captureGroup.length;
      const excludedMarks = (0, _getMarksBetween.getMarksBetween)(start, end, state).filter(item => item.mark.type.excludes(markType)).filter(item => item.end > matchStart);
      if (excludedMarks.length) {
        return null;
      }
      if (textEnd < end) {
        tr.delete(textEnd, end);
      }
      if (textStart > start) {
        tr.delete(matchStart, textStart);
      }
      start = matchStart;
      end = start + captureGroup.length;
    }
    tr.addMark(start, end, markType.create(attrs));
    tr.removeStoredMark(markType);
    return tr;
  });
}

/**
 * A factory function for creating a Prosemirror InputRule that automatically applies a mark to
 * text that is surrounded by a given pattern.
 *
 * @param pattern The pattern to match.
 * @param markType The mark type to apply.
 * @param getAttrs An optional function that returns the attributes to apply to the new mark.
 * @returns The input rule
 */
function markInputRuleForPattern(pattern, markType, getAttrs) {
  const escapedPattern = (0, _escapeRegExp.default)(pattern);
  return markInputRule(new RegExp(`(?:^|[\\s\\[\\{\\(])(?<remove>${escapedPattern}(?<text>[^${escapedPattern}]+)${escapedPattern})$`), markType, getAttrs);
}