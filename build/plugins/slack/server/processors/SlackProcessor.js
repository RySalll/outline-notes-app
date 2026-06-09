"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _types = require("./../../../../shared/types");
var _time = require("./../../../../shared/utils/time");
var _models = require("./../../../../server/models");
var _BaseProcessor = _interopRequireDefault(require("./../../../../server/queues/processors/BaseProcessor"));
var _fetch = _interopRequireDefault(require("./../../../../server/utils/fetch"));
var _timers = require("./../../../../server/utils/timers");
var _env = _interopRequireDefault(require("../env"));
var _messageAttachment = require("../presenters/messageAttachment");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class SlackProcessor extends _BaseProcessor.default {
  async perform(event) {
    switch (event.name) {
      case "documents.publish":
      case "revisions.create":
        // wait a few seconds to give the document summary chance to be generated
        await (0, _timers.sleep)(5000);
        return this.documentUpdated(event);
      case "integrations.create":
        return this.integrationCreated(event);
      default:
    }
  }
  async integrationCreated(event) {
    const integration = await _models.Integration.findOne({
      where: {
        id: event.modelId,
        service: _types.IntegrationService.Slack,
        type: _types.IntegrationType.Post
      },
      include: [{
        model: _models.Collection,
        required: true,
        as: "collection"
      }]
    });
    if (!integration) {
      return;
    }
    const collection = integration.collection;
    if (!collection) {
      return;
    }
    await (0, _fetch.default)(integration.settings.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: `👋 Hey there! When documents are published or updated in the *${collection.name}* collection on ${_env.default.APP_NAME} they will be posted to this channel!`,
        attachments: [{
          color: collection.color,
          title: collection.name,
          title_link: `${_env.default.URL}${collection.url}`,
          text: collection.description
        }]
      })
    });
  }
  async documentUpdated(event) {
    // never send notifications when batch importing documents
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type 'DocumentEv... Remove this comment to see the full error message
    if (event.data && event.data.source === "import") {
      return;
    }
    const [document, team] = await Promise.all([_models.Document.findByPk(event.documentId), _models.Team.findByPk(event.teamId)]);
    if (!document || !team) {
      return;
    }

    // never send notifications for draft documents
    if (!document.publishedAt) {
      return;
    }

    // if the document was published less than a minute ago, don't send a
    // separate notification.
    if (event.name === "revisions.create" && (0, _dateFns.differenceInMilliseconds)(document.updatedAt, document.publishedAt) < _time.Minute.ms) {
      return;
    }
    const integration = await _models.Integration.findOne({
      where: {
        teamId: document.teamId,
        collectionId: document.collectionId,
        service: _types.IntegrationService.Slack,
        type: _types.IntegrationType.Post,
        events: {
          [_sequelize.Op.contains]: [event.name === "revisions.create" ? "documents.update" : event.name]
        }
      }
    });
    if (!integration) {
      return;
    }
    let text = `${document.updatedBy.name} updated "${document.title}"`;
    if (event.name === "documents.publish") {
      text = `${document.createdBy.name} published "${document.title}"`;
    }
    await (0, _fetch.default)(integration.settings.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        attachments: [(0, _messageAttachment.presentMessageAttachment)(document, team, document.collection)]
      })
    });
  }
}
exports.default = SlackProcessor;
_defineProperty(SlackProcessor, "applicableEvents", ["documents.publish", "revisions.create", "integrations.create"]);