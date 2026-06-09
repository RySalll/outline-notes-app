"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentUpdater;
var _models = require("./../models");
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
/**
 * This command updates document properties. To update collaborative text state
 * use documentCollaborativeUpdater.
 *
 * @param Props The properties of the document to update
 * @returns Document The updated document
 */
async function documentUpdater(ctx, _ref) {
  let {
    user,
    document,
    title,
    icon,
    color,
    text,
    editorVersion,
    templateId,
    fullWidth,
    insightsEnabled,
    append,
    publish,
    collectionId,
    done
  } = _ref;
  const {
    transaction
  } = ctx.state;
  const previousTitle = document.title;
  const cId = collectionId || document.collectionId;
  if (title !== undefined) {
    document.title = title.trim();
  }
  if (icon !== undefined) {
    document.icon = icon;
  }
  if (color !== undefined) {
    document.color = color;
  }
  if (editorVersion) {
    document.editorVersion = editorVersion;
  }
  if (templateId) {
    document.templateId = templateId;
  }
  if (fullWidth !== undefined) {
    document.fullWidth = fullWidth;
  }
  if (insightsEnabled !== undefined) {
    document.insightsEnabled = insightsEnabled;
  }
  if (text !== undefined) {
    document = _DocumentHelper.DocumentHelper.applyMarkdownToDocument(document, text, append);
  }
  const changed = document.changed();
  const event = {
    name: "documents.update",
    documentId: document.id,
    collectionId: cId,
    data: {
      done,
      title: document.title
    }
  };
  if (publish && (document.template || cId)) {
    if (!document.collectionId) {
      document.collectionId = cId;
    }
    await document.publish(user, cId, {
      transaction
    });
    await _models.Event.createFromContext(ctx, {
      ...event,
      name: "documents.publish"
    });
  } else if (changed) {
    document.lastModifiedById = user.id;
    document.updatedBy = user;
    await document.save({
      transaction
    });
    await _models.Event.createFromContext(ctx, event);
  } else if (done) {
    await _models.Event.schedule({
      ...event,
      actorId: user.id,
      teamId: document.teamId
    });
  }
  if (document.title !== previousTitle) {
    await _models.Event.schedule({
      name: "documents.title_change",
      documentId: document.id,
      collectionId: cId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        previousTitle,
        title: document.title
      },
      ip: ctx.request.ip
    });
  }
  return await _models.Document.findByPk(document.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
}