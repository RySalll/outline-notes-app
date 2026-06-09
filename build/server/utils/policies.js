"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canUserAccessDocument = void 0;
var _models = require("./../models");
var _policies = require("./../policies");
/**
 * Check if the given user can access a document
 *
 * @param user - The user to check
 * @param documentId - The document to check
 * @returns Boolean whether the user can access the document
 */
const canUserAccessDocument = async (user, documentId) => {
  try {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", document);
    return true;
  } catch (err) {
    return false;
  }
};
exports.canUserAccessDocument = canUserAccessDocument;