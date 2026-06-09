"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _sequelize = require("sequelize");
var _parseTitle = _interopRequireDefault(require("./../../shared/utils/parseTitle"));
var _models = require("./../models");
var _database = require("./../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let page = parseInt(process.argv[2], 10);
page = Number.isNaN(page) ? 0 : page;
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  let limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
  const work = async page => {
    console.log(`Backfill revision emoji from title… page ${page}`);
    let revisions = [];
    await _database.sequelize.transaction(async transaction => {
      revisions = await _models.Revision.unscoped().findAll({
        attributes: ["id", "title", "emoji"],
        limit,
        offset: page * limit,
        order: [["createdAt", "ASC"]],
        paranoid: false,
        lock: _sequelize.Transaction.LOCK.UPDATE,
        transaction
      });
      for (const revision of revisions) {
        try {
          const {
            emoji,
            strippedTitle
          } = (0, _parseTitle.default)(revision.title);
          if (emoji) {
            revision.icon = emoji;
            revision.title = strippedTitle;
            if (revision.changed()) {
              console.log(`Migrating ${revision.id}…`);
              await revision.save({
                silent: true,
                transaction
              });
            }
          }
        } catch (err) {
          console.error(`Failed at ${revision.id}:`, err);
          continue;
        }
      }
    });
    return revisions.length === limit ? work(page + 1) : undefined;
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