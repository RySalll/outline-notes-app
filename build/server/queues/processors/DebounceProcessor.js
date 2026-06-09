"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _env = _interopRequireDefault(require("./../../env"));
var _Document = _interopRequireDefault(require("./../../models/Document"));
var _ = require("..");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class DebounceProcessor extends _BaseProcessor.default {
  async perform(event) {
    switch (event.name) {
      case "documents.update":
        {
          await _.globalEventQueue.add({
            ...event,
            name: "documents.update.delayed"
          }, {
            // speed up revision creation in development, we don't have all the
            // time in the world.
            delay: (_env.default.isProduction ? 5 : 0.5) * 60 * 1000
          });
          break;
        }
      case "documents.update.delayed":
        {
          const document = await _Document.default.findByPk(event.documentId, {
            attributes: ["updatedAt"]
          });

          // If the document has been deleted then prevent further processing
          if (!document) {
            return;
          }

          // If the document has been updated since we initially queued the delayed
          // event then abort, there must be another updated event in the queue –
          // this functions as a simple distributed debounce.
          if (document.updatedAt > new Date(event.createdAt)) {
            return;
          }
          await _.globalEventQueue.add({
            ...event,
            name: "documents.update.debounced"
          });
          break;
        }
      default:
    }
  }
}
exports.default = DebounceProcessor;
_defineProperty(DebounceProcessor, "applicableEvents", ["documents.update", "documents.update.delayed"]);