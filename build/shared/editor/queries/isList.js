"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isList = isList;
/**
 * Check if a node is a list node.
 *
 * @param node The node to check
 * @param schema The schema to check against
 * @returns True if the node is a list node, false otherwise
 */
function isList(node, schema) {
  return node.type === schema.nodes.bullet_list || node.type === schema.nodes.ordered_list || node.type === schema.nodes.checkbox_list;
}