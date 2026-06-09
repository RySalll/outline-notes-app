"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _sequelize = require("sequelize");
var _models = require("./../models");
var _database = require("./../storage/database");
let page = parseInt(process.argv[2], 10);
page = Number.isNaN(page) ? 0 : page;
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  let limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  const work = async page => {
    console.log(`Backfill apiKey hash… page ${page}`);
    let apiKeys = [];
    await _database.sequelize.transaction(async transaction => {
      apiKeys = await _models.ApiKey.unscoped().findAll({
        attributes: ["id", "secret", "value", "hash"],
        limit,
        offset: page * limit,
        order: [["createdAt", "ASC"]],
        lock: _sequelize.Transaction.LOCK.UPDATE,
        transaction
      });
      for (const apiKey of apiKeys) {
        try {
          if (!apiKey.hash) {
            console.log(`Migrating ${apiKey.id}…`);
            apiKey.value = apiKey.secret;
            apiKey.hash = _models.ApiKey.hash(apiKey.secret);
            // @ts-expect-error secret is deprecated
            apiKey.secret = null;
            await apiKey.save({
              transaction
            });
          }
        } catch (err) {
          console.error(`Failed at ${apiKey.id}:`, err);
          continue;
        }
      }
    });
    return apiKeys.length === limit ? work(page + 1) : undefined;
  };
  await work(page);
  console.log("Backfill complete");
  if (exit) {
    process.exit(0);
  }
}

// In the test suite we import the script rather than run via node CLI
if (process.env.NODE_ENV !== "test") {
  void main(true);
}