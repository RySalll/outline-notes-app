"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _sequelize = require("sequelize");
var _models = require("./../models");
var _database = require("./../storage/database");
const limit = 100;
let page = parseInt(process.argv[2], 10);
page = Number.isNaN(page) ? 0 : page;
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  const work = async page => {
    console.log(`Backfill user notification settings… page ${page}`);
    const users = await _models.User.findAll({
      attributes: ["id", "notificationSettings"],
      limit,
      offset: page * limit,
      order: [["createdAt", "ASC"]]
    });
    for (const user of users) {
      try {
        const settings = await _database.sequelize.query(`SELECT event FROM notification_settings WHERE "userId" = :userId`, {
          type: _sequelize.QueryTypes.SELECT,
          replacements: {
            userId: user.id
          }
        });
        const eventTypes = settings.map(setting => setting.event);
        user.notificationSettings = {};
        for (const eventType of eventTypes) {
          // @ts-expect-error old migration
          user.notificationSettings[eventType] = true;
          user.changed("notificationSettings", true);
        }
        await user.save({
          hooks: false,
          silent: true
        });
      } catch (err) {
        console.error(`Failed at ${user.id}:`, err);
        continue;
      }
    }
    return users.length === limit ? work(page + 1) : undefined;
  };
  await work(page);
  if (exit) {
    console.log("Backfill complete");
    process.exit(0);
  }
} // In the test suite we import the script rather than run via node CLI

if (process.env.NODE_ENV !== "test") {
  void main(true);
}