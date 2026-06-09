"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _teamUpdater = _interopRequireDefault(require("./../../commands/teamUpdater"));
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _DetachDraftsFromCollectionTask = _interopRequireDefault(require("../tasks/DetachDraftsFromCollectionTask"));
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class CollectionsProcessor extends _BaseProcessor.default {
  async perform(event) {
    await _DetachDraftsFromCollectionTask.default.schedule({
      collectionId: event.collectionId,
      actorId: event.actorId,
      ip: event.ip
    });
    await _database.sequelize.transaction(async transaction => {
      const team = await _models.Team.findByPk(event.teamId, {
        rejectOnEmpty: true,
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (team?.defaultCollectionId === event.collectionId) {
        const user = await _models.User.findByPk(event.actorId, {
          rejectOnEmpty: true,
          paranoid: false,
          transaction
        });
        await (0, _teamUpdater.default)({
          params: {
            defaultCollectionId: null
          },
          user,
          team,
          transaction,
          ip: event.ip
        });
      }
    });
  }
}
exports.default = CollectionsProcessor;
_defineProperty(CollectionsProcessor, "applicableEvents", ["collections.delete", "collections.archive"]);