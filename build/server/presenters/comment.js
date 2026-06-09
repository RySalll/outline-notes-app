"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;
var _ProsemirrorHelper = require("./../../shared/utils/ProsemirrorHelper");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function present(comment) {
  let {
    includeAnchorText
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let anchorText;
  if (includeAnchorText && comment.document) {
    const commentMarks = _ProsemirrorHelper.ProsemirrorHelper.getComments(_DocumentHelper.DocumentHelper.toProsemirror(comment.document));
    anchorText = _ProsemirrorHelper.ProsemirrorHelper.getAnchorTextForComment(commentMarks, comment.id);
  }
  return {
    id: comment.id,
    data: comment.data,
    documentId: comment.documentId,
    parentCommentId: comment.parentCommentId,
    createdBy: (0, _user.default)(comment.createdBy),
    createdById: comment.createdById,
    resolvedAt: comment.resolvedAt,
    resolvedBy: comment.resolvedBy ? (0, _user.default)(comment.resolvedBy) : null,
    resolvedById: comment.resolvedById,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    reactions: comment.reactions ?? [],
    anchorText
  };
}