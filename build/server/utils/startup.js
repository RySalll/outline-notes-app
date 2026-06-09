"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkDataMigrations = checkDataMigrations;
exports.checkPendingMigrations = checkPendingMigrations;
exports.printEnv = printEnv;
var _chalk = _interopRequireDefault(require("chalk"));
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _AuthenticationProvider = _interopRequireDefault(require("./../models/AuthenticationProvider"));
var _Team = _interopRequireDefault(require("./../models/Team"));
var _database = require("./../storage/database");
var _args = require("./args");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function checkPendingMigrations() {
  try {
    const pending = await _database.migrations.pending();
    if (!(0, _isEmpty.default)(pending)) {
      if ((0, _args.getArg)("no-migrate")) {
        _Logger.default.warn(_chalk.default.red(`Database migrations are pending and were not ran because --no-migrate flag was passed.\nRun the migrations with "yarn db:migrate".`));
        process.exit(1);
      } else {
        _Logger.default.info("database", "Running migrations…");
        await _database.migrations.up();
      }
    }
    await checkDataMigrations();
  } catch (err) {
    if (err.message.includes("ECONNREFUSED")) {
      _Logger.default.warn(_chalk.default.red(`Could not connect to the database. Please check your connection settings.`));
    } else {
      _Logger.default.warn(_chalk.default.red(err.message));
    }
    process.exit(1);
  }
}
async function checkDataMigrations() {
  if (_env.default.isCloudHosted) {
    return;
  }
  const team = await _Team.default.findOne();
  const provider = await _AuthenticationProvider.default.findOne();
  if (_env.default.isProduction && team && team.createdAt < new Date("2024-01-01") && !provider) {
    _Logger.default.warn(`
This version of Outline cannot start until a data migration is complete.
Backup your database, run the database migrations and the following script:
(Note: script run needed only when upgrading to any version between 0.54.0 and 0.61.1, including both)

$ node ./build/server/scripts/20210226232041-migrate-authentication.js
`);
    process.exit(1);
  }
}
async function printEnv() {
  if (_env.default.isProduction) {
    _Logger.default.info("lifecycle", _chalk.default.green(`
Is your team enjoying Outline? Consider supporting future development by sponsoring the project:\n\nhttps://github.com/sponsors/outline
`));
  } else if (_env.default.isDevelopment) {
    _Logger.default.warn(`Running Outline in ${_chalk.default.bold("development mode")}. To run Outline in production mode set the ${_chalk.default.bold("NODE_ENV")} env variable to "production"`);
  }
}