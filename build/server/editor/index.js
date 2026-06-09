"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializer = exports.schema = exports.parser = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _ExtensionManager = _interopRequireDefault(require("./../../shared/editor/lib/ExtensionManager"));
var _nodes = require("./../../shared/editor/nodes");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const extensions = (0, _nodes.withComments)(_nodes.richExtensions);
const extensionManager = new _ExtensionManager.default(extensions);
const schema = exports.schema = new _prosemirrorModel.Schema({
  nodes: extensionManager.nodes,
  marks: extensionManager.marks
});
const parser = exports.parser = extensionManager.parser({
  schema,
  plugins: extensionManager.rulePlugins
});
const serializer = exports.serializer = extensionManager.serializer();