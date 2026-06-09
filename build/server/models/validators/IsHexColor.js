"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = IsHexColor;
var _classValidator = require("class-validator");
var _sequelizeTypescript = require("sequelize-typescript");
/**
 * A decorator that validates that a string is a valid hex color code.
 */
function IsHexColor(target, propertyName) {
  return (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validDomain(value) {
        if (!(0, _classValidator.isHexColor)(value)) {
          throw new Error("Must be a valid hex color code");
        }
      }
    }
  });
}