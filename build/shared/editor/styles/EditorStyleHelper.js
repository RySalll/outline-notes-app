"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditorStyleHelper = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Class names and values used by the editor.
 */
class EditorStyleHelper {}
exports.EditorStyleHelper = EditorStyleHelper;
// Images
_defineProperty(EditorStyleHelper, "imageHandle", "image-handle");
// Comments
_defineProperty(EditorStyleHelper, "comment", "comment-marker");
// Tables
/** Table wrapper */
_defineProperty(EditorStyleHelper, "table", "table-wrapper");
/** Table grip (circle in top left) */
_defineProperty(EditorStyleHelper, "tableGrip", "table-grip");
/** Table row grip */
_defineProperty(EditorStyleHelper, "tableGripRow", "table-grip-row");
/** Table column grip */
_defineProperty(EditorStyleHelper, "tableGripColumn", "table-grip-column");
/** "Plus" to add column on tables */
_defineProperty(EditorStyleHelper, "tableAddColumn", "table-add-column");
/** "Plus" to add row on tables */
_defineProperty(EditorStyleHelper, "tableAddRow", "table-add-row");
/** Scrollable area of table */
_defineProperty(EditorStyleHelper, "tableScrollable", "table-scrollable");
/** Full-width table layout */
_defineProperty(EditorStyleHelper, "tableFullWidth", "table-full-width");
/** Shadow on the right side of the table */
_defineProperty(EditorStyleHelper, "tableShadowRight", "table-shadow-right");
/** Shadow on the left side of the table */
_defineProperty(EditorStyleHelper, "tableShadowLeft", "table-shadow-left");
// Global
/** Minimum padding around editor */
_defineProperty(EditorStyleHelper, "padding", 32);
/** Table of contents width */
_defineProperty(EditorStyleHelper, "tocWidth", 256);