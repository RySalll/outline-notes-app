"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTextSerializers = getTextSerializers;
/**
 * Generate a map of text serializers for a given schema
 * @param schema
 * @returns Text serializers
 */
function getTextSerializers(schema) {
  return Object.fromEntries(Object.entries(schema.nodes).filter(_ref => {
    let [, node] = _ref;
    return node.spec.toPlainText;
  }).map(_ref2 => {
    let [name, node] = _ref2;
    return [name, node.spec.toPlainText];
  }));
}