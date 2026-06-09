"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentDuplicator;
var _sequelize = require("sequelize");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("./../models/helpers/ProsemirrorHelper");
var _documentCreator = _interopRequireDefault(require("./documentCreator"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function documentDuplicator(_ref) {
  let {
    user,
    document,
    collection,
    parentDocumentId,
    title,
    publish,
    recursive,
    ctx
  } = _ref;
  const newDocuments = [];
  const sharedProperties = {
    user,
    collectionId: collection?.id,
    publish: publish ?? !!document.publishedAt,
    ctx
  };
  const duplicated = await (0, _documentCreator.default)({
    parentDocumentId,
    icon: document.icon,
    color: document.color,
    template: document.template,
    title: title ?? document.title,
    content: _ProsemirrorHelper.ProsemirrorHelper.removeMarks(_DocumentHelper.DocumentHelper.toProsemirror(document), ["comment"]),
    text: document.text,
    ...sharedProperties
  });
  duplicated.collection = collection ?? null;
  newDocuments.push(duplicated);
  async function duplicateChildDocuments(original, duplicated) {
    const childDocuments = await original.findChildDocuments({
      archivedAt: original.archivedAt ? {
        [_sequelize.Op.ne]: null
      } : {
        [_sequelize.Op.eq]: null
      }
    }, ctx);
    for (const childDocument of childDocuments) {
      const duplicatedChildDocument = await (0, _documentCreator.default)({
        parentDocumentId: duplicated.id,
        icon: childDocument.icon,
        color: childDocument.color,
        title: childDocument.title,
        content: _ProsemirrorHelper.ProsemirrorHelper.removeMarks(_DocumentHelper.DocumentHelper.toProsemirror(childDocument), ["comment"]),
        text: childDocument.text,
        ...sharedProperties
      });
      duplicatedChildDocument.collection = collection ?? null;
      newDocuments.push(duplicatedChildDocument);
      await duplicateChildDocuments(childDocument, duplicatedChildDocument);
    }
  }
  if (recursive && !document.template) {
    await duplicateChildDocuments(document, duplicated);
  }
  return newDocuments;
}