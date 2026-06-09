"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = IsFQDN;
var _classValidator = require("class-validator");
var _sequelizeTypescript = require("sequelize-typescript");
/**
 * A decorator that validates that a string is a fully qualified domain name.
 */
function IsFQDN(target, propertyName) {
  return (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validDomain(value) {
        if (!(0, _classValidator.isFQDN)(value)) {
          throw new Error("Must be a fully qualified domain name");
        }
      }
    }
  });
}