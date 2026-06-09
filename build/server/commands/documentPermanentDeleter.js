"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentPermanentDeleter;
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _sequelize = require("sequelize");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _models = require("./../models");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("./../models/helpers/ProsemirrorHelper");
var _DeleteAttachmentTask = _interopRequireDefault(require("./../queues/tasks/DeleteAttachmentTask"));
var _database = require("./../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function documentPermanentDeleter(documents) {
  const activeDocument = documents.find(doc => !doc.deletedAt);
  if (activeDocument) {
    throw new Error(`Cannot permanently delete ${activeDocument.id} document. Please delete it and try again.`);
  }
  const query = `
    SELECT COUNT(id)
    FROM documents
    WHERE "searchVector" @@ to_tsquery('english', :query) AND
    "teamId" = :teamId AND
    "id" != :documentId
  `;
  for (const document of documents) {
    // Find any attachments that are referenced in the text content
    const attachmentIdsInText = _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document));

    // Find any attachments that were originally uploaded to this document
    const attachmentIdsForDocument = (await _models.Attachment.findAll({
      attributes: ["id"],
      where: {
        teamId: document.teamId,
        documentId: document.id
      }
    })).map(attachment => attachment.id);
    const attachmentIds = (0, _uniq.default)([...attachmentIdsInText, ...attachmentIdsForDocument]);
    await Promise.all(attachmentIds.map(async attachmentId => {
      // Check if the attachment is referenced in any other documents – this
      // is needed as it's easy to copy and paste content between documents.
      // An uploaded attachment may end up referenced in multiple documents.
      const [{
        count
      }] = await _database.sequelize.query(query, {
        type: _sequelize.QueryTypes.SELECT,
        replacements: {
          documentId: document.id,
          teamId: document.teamId,
          query: attachmentId
        }
      });

      // If the attachment is not referenced in any other documents then
      // delete it from the database and the storage provider.
      if (parseInt(count) === 0) {
        _Logger.default.info("commands", `Attachment ${attachmentId} scheduled for deletion`);
        await _DeleteAttachmentTask.default.schedule({
          attachmentId,
          teamId: document.teamId
        });
      }
    }));
  }
  const documentIds = documents.map(document => document.id);
  await _models.Document.update({
    parentDocumentId: null
  }, {
    where: {
      parentDocumentId: {
        [_sequelize.Op.in]: documentIds
      }
    },
    paranoid: false
  });
  return _models.Document.scope("withDrafts").destroy({
    where: {
      id: documents.map(document => document.id)
    },
    force: true
  });
}