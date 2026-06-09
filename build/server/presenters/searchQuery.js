"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentSearchQuery;
function presentSearchQuery(searchQuery) {
  return {
    id: searchQuery.id,
    query: searchQuery.query,
    source: searchQuery.source,
    createdAt: searchQuery.createdAt,
    answer: searchQuery.answer,
    score: searchQuery.score
  };
}