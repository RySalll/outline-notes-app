"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _uuid = require("uuid");
var _types = require("./../../shared/types");
var _tracing = require("./../logging/tracing");
var _models = require("./../models");
var _AttachmentHelper = require("./../models/helpers/AttachmentHelper");
function getKeyForFileOp(teamId, format, name) {
  return `${_AttachmentHelper.Buckets.uploads}/${teamId}/${(0, _uuid.v4)()}/${name}-export.${format.replace(/outline-/, "")}.zip`;
}
async function collectionExporter(_ref) {
  let {
    collection,
    team,
    user,
    format = _types.FileOperationFormat.MarkdownZip,
    includeAttachments = true,
    ctx
  } = _ref;
  const collectionId = collection?.id;
  const key = getKeyForFileOp(user.teamId, format, collection?.name || team.name);
  const fileOperation = await _models.FileOperation.createWithCtx(ctx, {
    type: _types.FileOperationType.Export,
    state: _types.FileOperationState.Creating,
    format,
    key,
    url: null,
    size: 0,
    collectionId,
    options: {
      includeAttachments
    },
    userId: user.id,
    teamId: user.teamId
  });
  fileOperation.user = user;
  if (collection) {
    fileOperation.collection = collection;
  }
  return fileOperation;
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "collectionExporter"
})(collectionExporter);