"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function present(reaction) {
  return {
    id: reaction.id,
    emoji: reaction.emoji,
    commentId: reaction.commentId,
    user: (0, _user.default)(reaction.user),
    userId: reaction.userId,
    createdAt: reaction.createdAt,
    updatedAt: reaction.updatedAt
  };
}