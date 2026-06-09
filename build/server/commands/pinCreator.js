"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pinCreator;
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _sequelize = require("sequelize");
var _validations = require("./../../shared/validations");
var _errors = require("./../errors");
var _models = require("./../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This command creates a "pinned" document via the pin relation. A document can
 * be pinned to a collection or to the home screen.
 *
 * @param Props The properties of the pin to create
 * @returns Pin The pin that was created
 */
async function pinCreator(_ref) {
  let {
    ctx,
    user,
    documentId,
    collectionId,
    ...rest
  } = _ref;
  let {
    index
  } = rest;
  const where = {
    teamId: user.teamId,
    ...(collectionId ? {
      collectionId
    } : {
      collectionId: {
        [_sequelize.Op.is]: null
      }
    })
  };
  const count = await _models.Pin.count({
    where
  });
  if (count >= _validations.PinValidation.max) {
    throw (0, _errors.ValidationError)(`You cannot pin more than ${_validations.PinValidation.max} documents`);
  }
  if (!index) {
    const pins = await _models.Pin.findAll({
      where,
      attributes: ["id", "index", "updatedAt"],
      limit: 1,
      order: [
      // using LC_COLLATE:"C" because we need byte order to drive the sorting
      // find only the last pin so we can create an index after it
      _sequelize.Sequelize.literal('"pin"."index" collate "C" DESC'), ["updatedAt", "ASC"]]
    });

    // create a pin at the end of the list
    index = (0, _fractionalIndex.default)(pins.length ? pins[0].index : null, null);
  }
  const pin = await _models.Pin.createWithCtx(ctx, {
    createdById: user.id,
    teamId: user.teamId,
    collectionId,
    documentId,
    index
  });
  return pin;
}