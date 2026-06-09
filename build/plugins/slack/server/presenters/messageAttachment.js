"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.presentMessageAttachment = presentMessageAttachment;
function presentMessageAttachment(document, team, collection, context, actions) {
  // the context contains <b> tags around search terms, we convert them here
  // to the markdown format that slack expects to receive.
  const text = context ? context.replace(/<\/?b>/g, "*").replace(/\n/g, "") : document.getSummary();
  return {
    color: collection?.color,
    title: document.title,
    title_link: `${team.url}${document.url}`,
    footer: collection?.name,
    callback_id: document.id,
    text,
    ts: document.getTimestamp(),
    actions
  };
}