"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RevisionHelper = void 0;
class RevisionHelper {
  /**
   * Get a static id for the latest revision of a document.
   *
   * @param documentId The document to generate an ID for.
   * @returns The ID of the latest revision of the document.
   */
  static latestId(documentId) {
    return documentId ? `latest-${documentId}` : "";
  }
}
exports.RevisionHelper = RevisionHelper;