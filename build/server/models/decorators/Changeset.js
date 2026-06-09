"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkipChangeset = SkipChangeset;
exports.getChangsetSkipped = getChangsetSkipped;
require("reflect-metadata");
const key = Symbol("skipChangeset");

/**
 * This decorator is used to annotate a property as being skipped from being included in a changeset.
 */
function SkipChangeset(target, propertyKey) {
  const properties = Reflect.getMetadata(key, target);
  if (!properties) {
    return Reflect.defineMetadata(key, [propertyKey], target);
  }
  properties.push(propertyKey);
}

/**
 * This function is used to get the properties that should be skipped from a changeset.
 */
function getChangsetSkipped(target) {
  return Reflect.getMetadata(key, target) || [];
}