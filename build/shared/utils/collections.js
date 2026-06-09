"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortNavigationNodes = exports.colorPalette = void 0;
var _naturalSort = _interopRequireDefault(require("./naturalSort"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const sortNavigationNodes = function (nodes, sort) {
  let sortChildren = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  // "index" field is manually sorted and is represented by the documentStructure
  // already saved in the database, no further sort is needed
  if (sort.field === "index") {
    return nodes;
  }
  const orderedDocs = (0, _naturalSort.default)(nodes, sort.field, {
    direction: sort.direction
  });
  return orderedDocs.map(node => ({
    ...node,
    children: sortChildren ? sortNavigationNodes(node.children, sort, sortChildren) : node.children
  }));
};
exports.sortNavigationNodes = sortNavigationNodes;
const colorPalette = exports.colorPalette = ["#4E5C6E", "#0366D6", "#9E5CF7", "#FF825C", "#FF5C80", "#FFBE0B", "#42DED1", "#00D084", "#FF4DFA", "#2F362F"];