"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorTransform = require("prosemirror-transform");
const clearNodes = () => (state, dispatch) => {
  const {
    tr
  } = state;
  const {
    selection
  } = tr;
  const {
    ranges
  } = selection;
  if (!dispatch) {
    return true;
  }
  ranges.forEach(_ref => {
    let {
      $from,
      $to
    } = _ref;
    state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
      if (node.type.isText) {
        return;
      }
      const {
        doc,
        mapping
      } = tr;
      const $mappedFrom = doc.resolve(mapping.map(pos));
      const $mappedTo = doc.resolve(mapping.map(pos + node.nodeSize));
      const nodeRange = $mappedFrom.blockRange($mappedTo);
      if (!nodeRange) {
        return;
      }
      const targetLiftDepth = (0, _prosemirrorTransform.liftTarget)(nodeRange);
      if (node.type.isTextblock) {
        const {
          defaultType
        } = $mappedFrom.parent.contentMatchAt($mappedFrom.index());
        tr.setNodeMarkup(nodeRange.start, defaultType);
      }
      if (targetLiftDepth || targetLiftDepth === 0) {
        tr.lift(nodeRange, targetLiftDepth);
      }
    });
  });
  dispatch(tr);
  return true;
};
var _default = exports.default = clearNodes;