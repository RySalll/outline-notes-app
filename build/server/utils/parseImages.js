"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseImages;
var _editor = require("./../editor");
/**
 * Parses a string of markdown and returns a list of images.
 *
 * @param text The markdown to parse
 * @returns A unique list of images
 */
function parseImages(text) {
  const doc = _editor.parser.parse(text);
  const images = new Map();
  if (!doc) {
    return [];
  }
  doc.descendants(node => {
    if (node.type.name === "image") {
      if (!images.has(node.attrs.src)) {
        images.set(node.attrs.src, {
          src: node.attrs.src,
          alt: node.attrs.alt
        });
      }
      return false;
    }
    if (!node.content.size) {
      return false;
    }
    return true;
  });
  return Array.from(images.values());
}