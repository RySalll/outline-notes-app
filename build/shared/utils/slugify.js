"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = slugify;
var _slug = _interopRequireDefault(require("slug"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_slug.default.defaults.mode = "rfc3986";

/**
 * Convert a string to a slug that can be used in a URL in kebab-case format,
 * and remove periods.
 *
 * @param text The text to convert
 * @returns The slugified text
 */
function slugify(text) {
  return (0, _slug.default)(text, {
    remove: /[.]/g
  });
}