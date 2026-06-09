"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseDocumentSlug;
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Parse the likely document identifier from a given url.
 *
 * @param url The url to parse.
 * @returns A document identifier or undefined if not found.
 */
function parseDocumentSlug(url) {
  let parsed;
  if (url[0] === "/") {
    url = `${_env.default.URL}${url}`;
  }
  try {
    parsed = new URL(url).pathname;
  } catch (err) {
    return;
  }
  const split = parsed.split("/");
  const indexOfDoc = split.indexOf("doc");
  return split[indexOfDoc + 1] ?? undefined;
}