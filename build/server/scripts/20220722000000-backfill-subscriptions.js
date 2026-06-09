"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _models = require("./../models");
const limit = 1000;
let page = parseInt(process.argv[2], 10);
page = Number.isNaN(page) ? 0 : page;
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  const work = async page => {
    console.log(`Backfill subscription… page ${page}`);

    // Retrieve all documents within set limit.
    const documents = await _models.Document.findAll({
      attributes: ["collaboratorIds", "id"],
      limit,
      offset: page * limit,
      order: [["createdAt", "ASC"]]
    });
    for (const document of documents) {
      try {
        await Promise.all(document.collaboratorIds.map(collaboratorId => _models.Subscription.findOrCreate({
          where: {
            userId: collaboratorId,
            documentId: document.id,
            event: "documents.update"
          }
        })));
      } catch (err) {
        console.error(`Failed at ${document.id}:`, err);
        continue;
      }
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