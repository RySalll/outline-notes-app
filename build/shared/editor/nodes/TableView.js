"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TableView = void 0;
var _prosemirrorTables = require("prosemirror-tables");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _types = require("../types");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class TableView extends _prosemirrorTables.TableView {
  constructor(node, cellMinWidth) {
    super(node, cellMinWidth);
    this.node = node;
    this.cellMinWidth = cellMinWidth;
    _defineProperty(this, "scrollable", null);
    this.dom.removeChild(this.table);
    this.dom.classList.add(_EditorStyleHelper.EditorStyleHelper.table);

    // Add an extra wrapper to enable scrolling
    this.scrollable = this.dom.appendChild(document.createElement("div"));
    this.scrollable.appendChild(this.table);
    this.scrollable.classList.add(_EditorStyleHelper.EditorStyleHelper.tableScrollable);
    this.scrollable.addEventListener("scroll", () => {
      this.updateClassList(this.node);
    }, {
      passive: true
    });
    this.updateClassList(node);

    // We need to wait for the next tick to ensure dom is rendered and scroll shadows are correct.
    setTimeout(() => {
      if (this.dom) {
        this.updateClassList(node);
      }
    }, 0);
  }
  update(node) {
    this.updateClassList(node);
    return super.update(node);
  }
  ignoreMutation(record) {
    if (record.type === "attributes" && record.target === this.dom && (record.attributeName === "class" || record.attributeName === "style")) {
      return true;
    }
    return record.type === "attributes" && (record.target === this.table || this.colgroup.contains(record.target));
  }
  updateClassList(node) {
    this.dom.classList.toggle(_EditorStyleHelper.EditorStyleHelper.tableFullWidth, node.attrs.layout === _types.TableLayout.fullWidth);
    const shadowLeft = !!(this.scrollable && this.scrollable.scrollLeft > 0);
    const shadowRight = !!(this.scrollable && this.scrollable.scrollWidth > this.scrollable.clientWidth && this.scrollable.scrollLeft + this.scrollable.clientWidth < this.scrollable.scrollWidth - 1);
    this.dom.classList.toggle(_EditorStyleHelper.EditorStyleHelper.tableShadowLeft, shadowLeft);
    this.dom.classList.toggle(_EditorStyleHelper.EditorStyleHelper.tableShadowRight, shadowRight);
    if (this.scrollable) {
      this.dom.style.setProperty("--table-height", `${this.scrollable?.clientHeight}px`);
      this.dom.style.setProperty("--table-width", `${this.scrollable?.clientWidth}px`);
    } else {
      this.dom.style.removeProperty("--table-height");
      this.dom.style.removeProperty("--table-width");
    }
  }
}
exports.TableView = TableView;