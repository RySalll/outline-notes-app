"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = collectionDestroyer;
var _sequelize = require("sequelize");
var _models = require("./../models");
async function collectionDestroyer(_ref) {
  let {
    collection,
    transaction,
    user,
    ip
  } = _ref;
  await collection.destroy({
    transaction
  });
  await _models.Document.update({
    lastModifiedById: user.id,
    deletedAt: new Date()
  }, {
    transaction,
    where: {
      teamId: collection.teamId,
      collectionId: collection.id,
      archivedAt: {
        [_sequelize.Op.is]: null
      }
    }
  });
  await _models.Event.create({
    name: "collections.delete",
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: user.id,
    data: {
      name: collection.name
    },
    ip
  }, {
    transaction
  });
}