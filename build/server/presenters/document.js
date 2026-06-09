"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _time = require("./../../shared/utils/time");
var _tracing = require("./../logging/tracing");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function presentDocument(ctx, document) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  options = {
    isPublic: false,
    ...options
  };
  const asData = !ctx || Number(ctx?.headers["x-api-version"] ?? 0) >= 3;
  const data = await _DocumentHelper.DocumentHelper.toJSON(document, options.isPublic ? {
    signedUrls: _time.Hour.seconds,
    teamId: document.teamId,
    removeMarks: ["comment"],
    internalUrlBase: `/s/${options.shareId}`
  } : undefined);
  const text = !asData || options?.includeText ? document.text || _DocumentHelper.DocumentHelper.toMarkdown(data) : undefined;
  const res = {
    id: document.id,
    url: document.path,
    urlId: document.urlId,
    title: document.title,
    data: asData || options?.includeData ? data : undefined,
    text,
    icon: document.icon,
    color: document.color,
    tasks: document.tasks,
    createdAt: document.createdAt,
    createdBy: undefined,
    updatedAt: document.updatedAt,
    updatedBy: undefined,
    publishedAt: document.publishedAt,
    archivedAt: document.archivedAt,
    deletedAt: document.deletedAt,
    collaboratorIds: [],
    revision: document.revisionCount,
    fullWidth: document.fullWidth,
    collectionId: undefined,
    parentDocumentId: undefined,
    lastViewedAt: undefined,
    isCollectionDeleted: undefined
  };
  if (!!document.views && document.views.length > 0) {
    res.lastViewedAt = document.views[0].updatedAt;
  }
  if (!options.isPublic) {
    const source = await document.$get("import");
    res.isCollectionDeleted = await document.isCollectionDeleted();
    res.collectionId = document.collectionId;
    res.parentDocumentId = document.parentDocumentId;
    res.createdBy = (0, _user.default)(document.createdBy);
    res.updatedBy = (0, _user.default)(document.updatedBy);
    res.collaboratorIds = document.collaboratorIds;
    res.templateId = document.templateId;
    res.template = document.template;
    res.insightsEnabled = document.insightsEnabled;
    res.sourceMetadata = document.sourceMetadata ? {
      importedAt: source?.createdAt ?? document.createdAt,
      importType: source?.format,
      createdByName: document.sourceMetadata.createdByName,
      fileName: document.sourceMetadata?.fileName
    } : undefined;
  }
  return res;
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "presenters"
})(presentDocument);