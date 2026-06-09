"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unescape = exports.escape = void 0;
const escapes = [[/\\/g, "\\\\"], [/\*/g, "\\*"], [/^-/g, "\\-"], [/^\+ /g, "\\+ "], [/^(=+)/g, "\\$1"], [/^(#{1,6}) /g, "\\$1 "], [/`/g, "\\`"], [/^~~~/g, "\\~~~"], [/\[/g, "\\["], [/\]/g, "\\]"], [/\(/g, "\\("],
// OLN-91
[/\)/g, "\\)"],
// OLN-91
[/^>/g, "\\>"], [/_/g, "\\_"], [/^(\d+)\. /g, "$1\\. "], [/\$/g, "\\$"]];

/**
 * Escape markdown characters in a string
 *
 * @param text - The text to escape
 * @returns The escaped text
 */
const escape = function (text) {
  return escapes.reduce(function (accumulator, esc) {
    return accumulator.replace(esc[0], esc[1]);
  }, text);
};

/**
 * Unescape markdown characters in a string
 *
 * @param text - The text to unescape
 * @returns The unescaped text
 */
exports.escape = escape;
const unescape = function (text) {
  return text.replace(/\\([\\*+-\d.])/g, "$1");
};
exports.unescape = unescape;