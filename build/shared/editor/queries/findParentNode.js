"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findParentNodeClosestToPos = exports.findParentNode = void 0;
const findParentNode = predicate => _ref => {
  let {
    $from
  } = _ref;
  return findParentNodeClosestToPos($from, predicate);
};

/**
 * Iterates over parent nodes starting from the given `$pos`, returning the
 * closest node and its start position `predicate` returns truthy for. `start`
 * points to the start position of the node, `pos` points directly before the node.
 *
 * @param $pos position to start from
 * @param predicate filtering predicate function
 * @returns node and its start position
 */
exports.findParentNode = findParentNode;
const findParentNodeClosestToPos = ($pos, predicate) => {
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node
      };
    }
  }
  return undefined;
};
exports.findParentNodeClosestToPos = findParentNodeClosestToPos;