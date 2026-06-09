"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = IsUrlOrRelativePath;
var _classValidator = require("class-validator");
var _sequelizeTypescript = require("sequelize-typescript");
/**
 * A decorator that validates that a string is a url or relative path.
 */
function IsUrlOrRelativePath(target, propertyName) {
  return (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validUrlOrPath(value) {
        if (value && !(0, _classValidator.isURL)(value, {
          require_host: false,
          require_protocol: false
        })) {
          throw new Error("Must be a URL or relative path");
        }
      }
    }
  });
}