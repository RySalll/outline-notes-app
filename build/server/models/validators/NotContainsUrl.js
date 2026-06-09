"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = NotContainsUrl;
var _sequelizeTypescript = require("sequelize-typescript");
/**
 * A decorator that validates that a string does not include something that
 * looks like a URL.
 */
function NotContainsUrl(target, propertyName) {
  return (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      not: {
        args: /(www\.|file:|http:|https:)[^\s]+[\w]/,
        msg: "Must not contain a URL"
      }
    }
  });
}