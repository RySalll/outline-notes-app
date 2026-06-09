"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCellAttrs = getCellAttrs;
exports.setCellAttrs = setCellAttrs;
var _browser = require("../../utils/browser");
/**
 * Helper to get cell attributes from a DOM node, used when pasting table content.
 *
 * @param dom DOM node to get attributes from
 * @returns Cell attributes
 */
function getCellAttrs(dom) {
  if (typeof dom === "string") {
    return {};
  }
  const widthAttr = dom.getAttribute("data-colwidth");
  const widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(",").map(s => Number(s)) : null;
  const colspan = Number(dom.getAttribute("colspan") || 1);
  return {
    colspan,
    rowspan: Number(dom.getAttribute("rowspan") || 1),
    colwidth: widths && widths.length === colspan ? widths : null,
    alignment: dom.style.textAlign === "center" ? "center" : dom.style.textAlign === "right" ? "right" : null
  };
}

/**
 * Helper to serialize cell attributes on a node, used when copying table content.
 *
 * @param node Node to get attributes from
 * @returns Attributes for the cell
 */
function setCellAttrs(node) {
  const attrs = {};
  if (node.attrs.colspan !== 1) {
    attrs.colspan = node.attrs.colspan;
  }
  if (node.attrs.rowspan !== 1) {
    attrs.rowspan = node.attrs.rowspan;
  }
  if (node.attrs.alignment) {
    attrs.style = `text-align: ${node.attrs.alignment};`;
  }
  if (node.attrs.colwidth) {
    if (_browser.isBrowser) {
      attrs["data-colwidth"] = node.attrs.colwidth.join(",");
    } else {
      attrs.style = (attrs.style ?? "") + `min-width: ${node.attrs.colwidth}px;`;
    }
  }
  return attrs;
}