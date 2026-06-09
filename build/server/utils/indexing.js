"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collectionIndexing = collectionIndexing;
exports.starIndexing = starIndexing;
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _naturalSort = _interopRequireDefault(require("./../../shared/utils/naturalSort"));
var _models = require("./../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function collectionIndexing(teamId, _ref) {
  let {
    transaction
  } = _ref;
  const collections = await _models.Collection.findAll({
    where: {
      teamId,
      // no point in maintaining index of deleted collections.
      deletedAt: null
    },
    attributes: ["id", "index", "name"],
    transaction
  });
  const sortable = (0, _naturalSort.default)(collections, collection => collection.name);

  // for each collection with null index, use previous collection index to create new index
  let previousIndex = null;
  const promises = [];
  for (const collection of sortable) {
    if (collection.index === null) {
      collection.index = (0, _fractionalIndex.default)(previousIndex, null);
      promises.push(collection.save({
        transaction
      }));
    }
    previousIndex = collection.index;
  }
  await Promise.all(promises);
  const indexedCollections = {};
  sortable.forEach(collection => {
    indexedCollections[collection.id] = collection.index;
  });
  return indexedCollections;
}
async function starIndexing(userId) {
  const stars = await _models.Star.findAll({
    where: {
      userId
    }
  });
  const documents = await _models.Document.findAll({
    attributes: ["id", "updatedAt"],
    where: {
      id: stars.map(star => star.documentId).filter(Boolean)
    },
    order: [["updatedAt", "DESC"]]
  });
  const sortable = stars.sort(function (a, b) {
    return documents.findIndex(d => d.id === a.documentId) - documents.findIndex(d => d.id === b.documentId);
  });
  let previousIndex = null;
  const promises = [];
  for (const star of sortable) {
    if (star.index === null) {
      star.index = (0, _fractionalIndex.default)(previousIndex, null);
      promises.push(star.save());
    }
    previousIndex = star.index;
  }
  await Promise.all(promises);
  const indexedStars = {};
  sortable.forEach(star => {
    indexedStars[star.id] = star.index;
  });
  return indexedStars;
}