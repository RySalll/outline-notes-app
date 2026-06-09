"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _prosemirrorModel = require("prosemirror-model");
var _yProsemirror = require("y-prosemirror");
var Y = _interopRequireWildcard(require("yjs"));
var _editor = require("./../editor");
var _models = require("./../models");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const limit = 100;
const page = 0;
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  const work = async page => {
    console.log(`Backfill content… page ${page}`);

    // Retrieve all documents within set limit.
    const documents = await _models.Document.unscoped().findAll({
      attributes: ["id", "urlId", "content", "text", "state"],
      limit,
      offset: page * limit,
      order: [["createdAt", "ASC"]],
      paranoid: false
    });
    for (const document of documents) {
      if (document.content || !document.text) {
        continue;
      }
      console.log(`Writing content for ${document.id}`);
      if ("state" in document && document.state) {
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, document.state);
        document.content = (0, _yProsemirror.yDocToProsemirrorJSON)(ydoc, "default");
      } else {
        const node = _editor.parser.parse(document.text) || _prosemirrorModel.Node.fromJSON(_editor.schema, {});
        document.content = node.toJSON();
      }
      document.changed("content", true);
      await document.save({
        hooks: false,
        silent: true
      });
    }
    return documents.length === limit ? work(page + 1) : undefined;
  };
  await work(page);
  if (exit) {
    console.log("Backfill complete");
    process.exit(0);
  }
}
if (process.env.NODE_ENV !== "test") {
  void main(true);
}