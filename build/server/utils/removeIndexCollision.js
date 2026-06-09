"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeIndexCollision;
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _sequelize = require("sequelize");
var _Collection = _interopRequireDefault(require("./../models/Collection"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 *
 * @param teamId The team id whose collections has to be fetched
 * @param index the index for which collision has to be checked
 * @param options Additional options to be passed to the query
 * @returns An index, if there is collision returns a new index otherwise the same index
 */
async function removeIndexCollision(teamId, index) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const collection = await _Collection.default.findOne({
    where: {
      teamId,
      deletedAt: null,
      index
    },
    ...options
  });
  if (!collection) {
    return index;
  }
  const nextCollection = await _Collection.default.findAll({
    where: {
      teamId,
      deletedAt: null,
      index: {
        [_sequelize.Op.gt]: index
      }
    },
    attributes: ["id", "index"],
    limit: 1,
    order: [_sequelize.Sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]],
    ...options
  });
  const nextCollectionIndex = nextCollection.length ? nextCollection[0].index : null;
  return (0, _fractionalIndex.default)(index, nextCollectionIndex);
}