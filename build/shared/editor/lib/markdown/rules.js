"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeRules;
var _markdownIt = _interopRequireDefault(require("markdown-it"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function makeRules(_ref) {
  let {
    rules = {},
    plugins = [],
    schema
  } = _ref;
  const markdownIt = (0, _markdownIt.default)("default", {
    breaks: false,
    html: false,
    linkify: false,
    ...rules
  });

  // Disable default markdown-it rules that are not supported by the schema.
  if (!schema?.nodes.ordered_list || !schema?.nodes.bullet_list) {
    markdownIt.disable("list");
  }
  if (!schema?.nodes.blockquote) {
    markdownIt.disable("blockquote");
  }
  if (!schema?.nodes.hr) {
    markdownIt.disable("hr");
  }
  if (!schema?.nodes.heading) {
    markdownIt.disable("heading");
  }
  plugins.forEach(plugin => markdownIt.use(plugin));
  return markdownIt;
}