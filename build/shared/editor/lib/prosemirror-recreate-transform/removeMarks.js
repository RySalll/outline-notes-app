"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeMarks = removeMarks;
var _prosemirrorTransform = require("prosemirror-transform");
function removeMarks(doc) {
  const tr = new _prosemirrorTransform.Transform(doc);
  tr.removeMark(0, doc.nodeSize - 2);
  return tr.doc;
}