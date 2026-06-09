"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _prosemirrorModel = require("prosemirror-model");
var _editor = require("./../editor");
var _models = require("./../models");
const limit = 100;
const page = 0;
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  const work = async page => {
    console.log(`Backfill content… page ${page}`);

    // Retrieve all revisions within set limit.
    const revisions = await _models.Revision.unscoped().findAll({
      attributes: ["id", "content", "text"],
      limit,
      offset: page * limit,
      order: [["createdAt", "ASC"]],
      paranoid: false
    });
    for (const revision of revisions) {
      if (revision.content || !revision.text) {
        continue;
      }
      console.log(`Writing content for ${revision.id}`);
      const node = _editor.parser.parse(revision.text) || _prosemirrorModel.Node.fromJSON(_editor.schema, {});
      revision.content = node.toJSON();
      revision.changed("content", true);
      await revision.save({
        hooks: false,
        silent: true
      });
    }
    return revisions.length === limit ? work(page + 1) : undefined;
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