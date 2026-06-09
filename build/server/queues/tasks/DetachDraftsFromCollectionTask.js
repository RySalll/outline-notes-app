"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _documentMover = _interopRequireDefault(require("./../../commands/documentMover"));
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _BaseTask = _interopRequireDefault(require("./BaseTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DetachDraftsFromCollectionTask extends _BaseTask.default {
  async perform(props) {
    const [collection, actor] = await Promise.all([_models.Collection.findByPk(props.collectionId, {
      paranoid: false
    }), _models.User.findByPk(props.actorId)]);
    if (!actor || !collection || !(collection.deletedAt || collection.archivedAt)) {
      return;
    }
    const documents = await _models.Document.scope("withDrafts").findAll({
      where: {
        collectionId: props.collectionId,
        template: false,
        publishedAt: {
          [_sequelize.Op.is]: null
        }
      },
      paranoid: false
    });
    return _database.sequelize.transaction(async transaction => {
      for (const document of documents) {
        await (0, _documentMover.default)({
          document,
          user: actor,
          ip: props.ip,
          collectionId: null,
          transaction
        });
      }
    });
  }
}
exports.default = DetachDraftsFromCollectionTask;