"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var _types = require("./../../shared/types");
var _email = require("./../../shared/utils/email");
var _teamCreator = _interopRequireDefault(require("./../commands/teamCreator"));
var _env = _interopRequireDefault(require("./../env"));
var _models = require("./../models");
var _database = require("./../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const email = process.argv[2];
async function main() {
  let exit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  const teamCount = await _models.Team.count();
  if (teamCount === 0) {
    const name = (0, _email.parseEmail)(email).local;
    const user = await _database.sequelize.transaction(async transaction => {
      const team = await (0, _teamCreator.default)({
        name: "Wiki",
        subdomain: "wiki",
        authenticationProviders: [],
        transaction,
        ip: "127.0.0.1"
      });
      return await _models.User.create({
        teamId: team.id,
        name,
        email,
        role: _types.UserRole.Admin
      }, {
        transaction
      });
    });
    console.log("email", `✅ Seed done – sign-in link: ${_env.default.URL}/auth/email.callback?token=${user.getEmailSigninToken()}`);
  } else {
    console.log("Team already exists, aborting");
  }
  if (exit) {
    process.exit(0);
  }
}
if (process.env.NODE_ENV !== "test") {
  void main(true);
}