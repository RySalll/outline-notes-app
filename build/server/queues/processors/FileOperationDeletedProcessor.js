"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("./../../../shared/types");
var _collectionDestroyer = _interopRequireDefault(require("./../../commands/collectionDestroyer"));
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class FileOperationDeletedProcessor extends _BaseProcessor.default {
  async perform(event) {
    await _database.sequelize.transaction(async transaction => {
      const fileOperation = await _models.FileOperation.findByPk(event.modelId, {
        rejectOnEmpty: true,
        paranoid: false,
        transaction
      });
      if (fileOperation.type === _types.FileOperationType.Export) {
        return;
      }
      if (event.name === "fileOperations.update" && fileOperation.state !== _types.FileOperationState.Error) {
        return;
      }
      if (event.name === "fileOperations.delete" && ![_types.FileOperationState.Complete, _types.FileOperationState.Error].includes(fileOperation.state)) {
        return;
      }
      const user = await _models.User.findByPk(event.actorId, {
        rejectOnEmpty: true,
        paranoid: false,
        transaction
      });
      const collections = await _models.Collection.findAll({
        transaction,
        lock: transaction.LOCK.UPDATE,
        where: {
          teamId: fileOperation.teamId,
          importId: fileOperation.id
        }
      });
      for (const collection of collections) {
        _Logger.default.debug("processor", "Destroying collection created from import", {
          collectionId: collection.id
        });
        await (0, _collectionDestroyer.default)({
          collection,
          transaction,
          user,
          ip: event.ip
        });
      }
    });
  }
}
exports.default = FileOperationDeletedProcessor;
_defineProperty(FileOperationDeletedProcessor, "applicableEvents", ["fileOperations.delete", "fileOperations.update"]);