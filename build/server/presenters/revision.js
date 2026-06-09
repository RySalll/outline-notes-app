"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _parseTitle = _interopRequireDefault(require("./../../shared/utils/parseTitle"));
var _tracing = require("./../logging/tracing");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function presentRevision(revision, diff) {
  // TODO: Remove this fallback once all revisions have been migrated
  const {
    emoji,
    strippedTitle
  } = (0, _parseTitle.default)(revision.title);
  return {
    id: revision.id,
    documentId: revision.documentId,
    title: strippedTitle,
    data: await _DocumentHelper.DocumentHelper.toJSON(revision),
    icon: revision.icon ?? emoji,
    color: revision.color,
    html: diff,
    createdAt: revision.createdAt,
    createdBy: (0, _user.default)(revision.user)
  };
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "presenters"
})(presentRevision);