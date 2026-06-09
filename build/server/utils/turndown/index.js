"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _turndownPluginGfm = require("@joplin/turndown-plugin-gfm");
var _turndown = _interopRequireDefault(require("turndown"));
var _markdown = require("./../../../shared/utils/markdown");
var _breaks = _interopRequireDefault(require("./breaks"));
var _emptyLists = _interopRequireDefault(require("./emptyLists"));
var _emptyParagraph = _interopRequireDefault(require("./emptyParagraph"));
var _frames = _interopRequireDefault(require("./frames"));
var _images = _interopRequireDefault(require("./images"));
var _inlineLink = _interopRequireDefault(require("./inlineLink"));
var _sanitizeLists = _interopRequireDefault(require("./sanitizeLists"));
var _sanitizeTables = _interopRequireDefault(require("./sanitizeTables"));
var _tables = _interopRequireDefault(require("./tables"));
var _underlines = _interopRequireDefault(require("./underlines"));
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Turndown converts HTML to Markdown and is used in the importer code.
 *
 * For options, see: https://github.com/domchristie/turndown#options
 */
const service = new _turndown.default({
  hr: "---",
  bulletListMarker: "-",
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  blankReplacement: (_, node) => node.nodeName === "P" && !(0, _utils.inHtmlContext)(node, "td, th") ? "\n\n\\\n" : ""
}).remove(["script", "style", "title", "head"]).use(_turndownPluginGfm.taskListItems).use(_turndownPluginGfm.strikethrough).use(_tables.default).use(_inlineLink.default).use(_emptyParagraph.default).use(_sanitizeTables.default).use(_sanitizeLists.default).use(_underlines.default).use(_frames.default).use(_images.default).use(_breaks.default).use(_emptyLists.default);
service.escape = _markdown.escape;
var _default = exports.default = service;