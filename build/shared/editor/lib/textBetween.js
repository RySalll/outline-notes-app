"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = textBetween;
/**
 * Returns the text content between two positions.
 *
 * @param doc The Prosemirror document to use
 * @param from A start point
 * @param to An end point
 * @param plainTextSerializers A map of node names to PlainTextSerializers which convert a node to plain text
 * @returns A string of plain text
 */
function textBetween(doc, from, to, plainTextSerializers) {
  let text = "";
  let first = true;
  const blockSeparator = "\n";
  doc.nodesBetween(from, to, (node, pos) => {
    const toPlainText = plainTextSerializers[node.type.name];
    let nodeText = "";
    if (toPlainText) {
      nodeText += toPlainText(node);
    } else if (node.isText) {
      nodeText += node.textBetween(Math.max(from, pos) - pos, to - pos, blockSeparator);
    }
    if (node.isBlock && (node.isLeaf && nodeText || node.isTextblock) && blockSeparator) {
      if (first) {
        first = false;
      } else {
        text += blockSeparator;
      }
    }
    text += nodeText;
  });
  return text;
}