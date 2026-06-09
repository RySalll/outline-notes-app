"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fastDeepEqual = _interopRequireDefault(require("fast-deep-equal"));
var _revisionCreator = _interopRequireDefault(require("./../../commands/revisionCreator"));
var _models = require("./../../models");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class RevisionsProcessor extends _BaseProcessor.default {
  async perform(event) {
    switch (event.name) {
      case "documents.publish":
      case "documents.update.debounced":
      case "documents.update":
        {
          if (event.name === "documents.update" && !event.data.done) {
            return;
          }
          const document = await _models.Document.findByPk(event.documentId, {
            paranoid: false,
            rejectOnEmpty: true
          });
          const previous = await _models.Revision.findLatest(document.id);

          // we don't create revisions if identical to previous revision, this can happen if a manual
          // revision was created from another service or user.
          if (previous && (0, _fastDeepEqual.default)(document.content, previous.content) && document.title === previous.title) {
            return;
          }
          const user = await _models.User.findByPk(event.actorId, {
            paranoid: false,
            rejectOnEmpty: true
          });
          await (0, _revisionCreator.default)({
            event,
            user,
            document
          });
          break;
        }
      default:
    }
  }
}
exports.default = RevisionsProcessor;
_defineProperty(RevisionsProcessor, "applicableEvents", ["documents.publish", "documents.update", "documents.update.debounced"]);