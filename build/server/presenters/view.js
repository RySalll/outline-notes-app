"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentView;
var _presenters = require("../presenters");
function presentView(view) {
  return {
    id: view.id,
    documentId: view.documentId,
    count: view.count,
    firstViewedAt: view.createdAt,
    lastViewedAt: view.updatedAt,
    userId: view.userId,
    user: (0, _presenters.presentUser)(view.user)
  };
}