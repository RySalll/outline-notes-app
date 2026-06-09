"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentCreator;
var _ProsemirrorHelper = require("./../../shared/utils/ProsemirrorHelper");
var _TextHelper = require("./../../shared/utils/TextHelper");
var _models = require("./../models");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
async function documentCreator(_ref) {
  let {
    title,
    text,
    icon,
    color,
    state,
    id,
    urlId,
    publish,
    collectionId,
    parentDocumentId,
    content,
    template,
    templateDocument,
    fullWidth,
    importId,
    createdAt,
    // allows override for import
    updatedAt,
    user,
    editorVersion,
    publishedAt,
    sourceMetadata,
    ctx
  } = _ref;
  const {
    transaction,
    ip
  } = ctx.context;
  const templateId = templateDocument ? templateDocument.id : undefined;
  if (state && templateDocument) {
    throw new Error("State cannot be set when creating a document from a template");
  }
  if (urlId) {
    const existing = await _models.Document.unscoped().findOne({
      attributes: ["id"],
      transaction,
      where: {
        urlId
      }
    });
    if (existing) {
      urlId = undefined;
    }
  }
  const document = await _models.Document.create({
    id,
    urlId,
    parentDocumentId,
    editorVersion,
    collectionId,
    teamId: user.teamId,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    lastModifiedById: user.id,
    createdById: user.id,
    template,
    templateId,
    publishedAt,
    importId,
    sourceMetadata,
    fullWidth: templateDocument ? templateDocument.fullWidth : fullWidth,
    icon: templateDocument ? templateDocument.icon : icon,
    color: templateDocument ? templateDocument.color : color,
    title: title ?? (templateDocument ? template ? templateDocument.title : _TextHelper.TextHelper.replaceTemplateVariables(templateDocument.title, user) : ""),
    text: text ?? (templateDocument ? template ? templateDocument.text : _TextHelper.TextHelper.replaceTemplateVariables(templateDocument.text, user) : ""),
    content: templateDocument ? _ProsemirrorHelper.ProsemirrorHelper.replaceTemplateVariables(await _DocumentHelper.DocumentHelper.toJSON(templateDocument), user) : content,
    state
  }, {
    silent: !!createdAt,
    transaction
  });
  await _models.Event.create({
    name: "documents.create",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      source: importId ? "import" : undefined,
      title: document.title,
      templateId
    },
    ip
  }, {
    transaction
  });
  if (publish) {
    if (!collectionId && !template) {
      throw new Error("Collection ID is required to publish");
    }
    await document.publish(user, collectionId, {
      silent: true,
      transaction
    });
    if (document.title) {
      await _models.Event.create({
        name: "documents.publish",
        documentId: document.id,
        collectionId: document.collectionId,
        teamId: document.teamId,
        actorId: user.id,
        data: {
          source: importId ? "import" : undefined,
          title: document.title
        },
        ip
      }, {
        transaction
      });
    }
  }

  // reload to get all of the data needed to present (user, collection etc)
  // we need to specify publishedAt to bypass default scope that only returns
  // published documents
  return _models.Document.findByPk(document.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
}