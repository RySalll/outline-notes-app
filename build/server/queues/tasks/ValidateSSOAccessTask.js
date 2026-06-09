"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ValidateSSOAccessTask extends _BaseTask.default {
  async perform(_ref) {
    let {
      userId
    } = _ref;
    await _database.sequelize.transaction(async transaction => {
      const userAuthentications = await _models.UserAuthentication.findAll({
        where: {
          userId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (userAuthentications.length === 0) {
        return;
      }
      try {
        // Check the validity of all the user's associated authentications.
        // @ts-expect-error TODO: Need to setup nested tsconfig with ES2021
        const valid = await Promise.any(userAuthentications.map(async authentication => authentication.validateAccess({
          transaction
        })));

        // If any are valid then we're done here.
        if (valid) {
          return;
        }
      } catch (err) {
        // Promise.any will throw an AggregateError if all validateAccess calls throw, this would
        // only be the case if all receive an unexpected error. We want to throw the first error
        // as a descriptive error message.
        if ("errors" in err && err.errors.length > 0) {
          throw err.errors[0];
        }
      }

      // If all are invalid then we need to revoke the users Outline sessions.
      const user = await _models.User.findByPk(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      _Logger.default.info("task", `Authentication token no longer valid for ${user?.id}`);
      await user?.rotateJwtSecret({
        transaction
      });
    });
  }
  get options() {
    return {
      attempts: 2,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = ValidateSSOAccessTask;