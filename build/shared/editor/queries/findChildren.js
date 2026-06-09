"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findBlockNodes = findBlockNodes;
exports.findChildren = findChildren;
exports.flatten = flatten;
function flatten(node) {
  let descend = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  if (!node) {
    throw new Error('Invalid "node" parameter');
  }
  const result = [];
  node.descendants((child, pos) => {
    result.push({
      node: child,
      pos
    });
    if (!descend) {
      return false;
    }
    return undefined;
  });
  return result;
}

/**
 * Iterates over descendants of a given `node`, returning child nodes predicate
 * returns truthy for. It doesn't descend into a node when descend argument is
 * `false` (defaults to `true`).
 *
 * @param node The node to iterate over
 * @param predicate Filtering predicate function
 * @param descend Whether to descend into a node
 * @returns Child nodes
 */
function findChildren(node, predicate) {
  let descend = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten(node, descend).filter(child => predicate(child.node));
}

/**
 * Iterates over descendants of a given `node`, returning child nodes that
 * are blocks.
 *
 * @param node The node to iterate over
 * @param descend Whether to descend into a node
 * @returns Child nodes that are blocks
 */
function findBlockNodes(node) {
  let descend = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return findChildren(node, child => child.isBlock, descend);
}