"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeFetch = require("node-fetch");
var _sequelize = require("sequelize");
var _collections = require("./../../../../shared/utils/collections");
var _WebhookDisabledEmail = _interopRequireDefault(require("./../../../../server/emails/templates/WebhookDisabledEmail"));
var _env = _interopRequireDefault(require("./../../../../server/env"));
var _Logger = _interopRequireDefault(require("./../../../../server/logging/Logger"));
var _models = require("./../../../../server/models");
var _presenters = require("./../../../../server/presenters");
var _BaseTask = _interopRequireDefault(require("./../../../../server/queues/tasks/BaseTask"));
var _fetch = _interopRequireDefault(require("./../../../../server/utils/fetch"));
var _webhook = _interopRequireDefault(require("../presenters/webhook"));
var _webhookSubscription = _interopRequireDefault(require("../presenters/webhookSubscription"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function assertUnreachable(event) {
  _Logger.default.warn(`DeliverWebhookTask did not handle ${event.name}`);
}
class DeliverWebhookTask extends _BaseTask.default {
  async perform(_ref) {
    let {
      subscriptionId,
      event
    } = _ref;
    const subscription = await _models.WebhookSubscription.findByPk(subscriptionId, {
      rejectOnEmpty: true
    });
    if (!subscription.enabled) {
      _Logger.default.info("task", `WebhookSubscription was disabled before delivery`, {
        event: event.name,
        subscriptionId: subscription.id
      });
      return;
    }
    _Logger.default.info("task", `DeliverWebhookTask: ${event.name}`, {
      event: event.name,
      subscriptionId: subscription.id
    });
    switch (event.name) {
      case "api_keys.create":
      case "api_keys.delete":
      case "attachments.create":
      case "attachments.update":
      case "attachments.delete":
      case "subscriptions.create":
      case "subscriptions.delete":
      case "authenticationProviders.update":
      case "notifications.create":
      case "notifications.update":
        // Ignored
        return;
      case "users.create":
      case "users.signin":
      case "users.signout":
      case "users.update":
      case "users.suspend":
      case "users.activate":
      case "users.delete":
      case "users.invite":
      case "users.promote":
      case "users.demote":
        await this.handleUserEvent(subscription, event);
        return;
      case "documents.create":
      case "documents.publish":
      case "documents.unpublish":
      case "documents.delete":
      case "documents.permanent_delete":
      case "documents.archive":
      case "documents.unarchive":
      case "documents.restore":
      case "documents.move":
      case "documents.update":
      case "documents.title_change":
        await this.handleDocumentEvent(subscription, event);
        return;
      case "documents.add_user":
      case "documents.remove_user":
        await this.handleDocumentUserEvent(subscription, event);
        return;
      case "documents.add_group":
      case "documents.remove_group":
        await this.handleDocumentGroupEvent(subscription, event);
        return;
      case "documents.update.delayed":
      case "documents.update.debounced":
      case "documents.empty_trash":
        // Ignored
        return;
      case "revisions.create":
        await this.handleRevisionEvent(subscription, event);
        return;
      case "fileOperations.create":
      case "fileOperations.update":
      case "fileOperations.delete":
        await this.handleFileOperationEvent(subscription, event);
        return;
      case "collections.create":
      case "collections.update":
      case "collections.delete":
      case "collections.move":
      case "collections.permission_changed":
      case "collections.archive":
      case "collections.restore":
        await this.handleCollectionEvent(subscription, event);
        return;
      case "collections.add_user":
      case "collections.remove_user":
        await this.handleCollectionUserEvent(subscription, event);
        return;
      case "collections.add_group":
      case "collections.remove_group":
        await this.handleCollectionGroupEvent(subscription, event);
        return;
      case "comments.create":
      case "comments.update":
      case "comments.delete":
        await this.handleCommentEvent(subscription, event);
        return;
      case "comments.add_reaction":
      case "comments.remove_reaction":
        // Ignored
        return;
      case "groups.create":
      case "groups.update":
      case "groups.delete":
        await this.handleGroupEvent(subscription, event);
        return;
      case "groups.add_user":
      case "groups.remove_user":
        await this.handleGroupUserEvent(subscription, event);
        return;
      case "integrations.create":
      case "integrations.update":
      case "integrations.delete":
        await this.handleIntegrationEvent(subscription, event);
        return;
      case "teams.create":
      case "teams.delete":
      case "teams.destroy":
        // Ignored
        return;
      case "teams.update":
        await this.handleTeamEvent(subscription, event);
        return;
      case "pins.create":
      case "pins.update":
      case "pins.delete":
        await this.handlePinEvent(subscription, event);
        return;
      case "stars.create":
      case "stars.update":
      case "stars.delete":
        await this.handleStarEvent(subscription, event);
        return;
      case "shares.create":
      case "shares.update":
      case "shares.revoke":
        await this.handleShareEvent(subscription, event);
        return;
      case "webhookSubscriptions.create":
      case "webhookSubscriptions.delete":
      case "webhookSubscriptions.update":
        await this.handleWebhookSubscriptionEvent(subscription, event);
        return;
      case "views.create":
        await this.handleViewEvent(subscription, event);
        return;
      case "userMemberships.update":
        // Ignored
        return;
      default:
        assertUnreachable(event);
    }
  }
  async handleWebhookSubscriptionEvent(subscription, event) {
    const model = await _models.WebhookSubscription.findByPk(event.modelId, {
      paranoid: false
    });
    let data = null;
    if (model) {
      data = {
        ...(0, _webhookSubscription.default)(model),
        secret: undefined
      };
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: data
      }
    });
  }
  async handleViewEvent(subscription, event) {
    const model = await _models.View.scope("withUser").findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentView)(model)
      }
    });
  }
  async handleStarEvent(subscription, event) {
    const model = await _models.Star.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentStar)(model)
      }
    });
  }
  async handleShareEvent(subscription, event) {
    const model = await _models.Share.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentShare)(model)
      }
    });
  }
  async handleCommentEvent(subscription, event) {
    const model = await _models.Comment.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentComment)(model)
      }
    });
  }
  async handlePinEvent(subscription, event) {
    const model = await _models.Pin.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentPin)(model)
      }
    });
  }
  async handleTeamEvent(subscription, event) {
    const model = await _models.Team.scope("withDomains").findByPk(event.teamId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.teamId,
        model: model && (0, _presenters.presentTeam)(model)
      }
    });
  }
  async handleIntegrationEvent(subscription, event) {
    const model = await _models.Integration.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentIntegration)(model)
      }
    });
  }
  async handleGroupEvent(subscription, event) {
    const model = await _models.Group.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (await (0, _presenters.presentGroup)(model))
      }
    });
  }
  async handleGroupUserEvent(subscription, event) {
    const model = await _models.GroupUser.scope(["withUser", "withGroup"]).findOne({
      where: {
        groupId: event.modelId,
        userId: event.userId
      },
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: `${event.userId}-${event.modelId}`,
        model: model && (0, _presenters.presentGroupUser)(model),
        group: model && (await (0, _presenters.presentGroup)(model.group)),
        user: model && (0, _presenters.presentUser)(model.user)
      }
    });
  }
  async handleCollectionEvent(subscription, event) {
    const model = await _models.Collection.findByPk(event.collectionId, {
      paranoid: false
    });
    const collection = model && (await (0, _presenters.presentCollection)(undefined, model));
    if (collection) {
      // For backward compatibility, set a default color.
      collection.color = collection.color ?? _collections.colorPalette[0];
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.collectionId,
        model: collection
      }
    });
  }
  async handleCollectionUserEvent(subscription, event) {
    const model = await _models.UserMembership.scope(["withUser", "withCollection"]).findOne({
      where: {
        collectionId: event.collectionId,
        userId: event.userId
      },
      paranoid: false
    });
    const collection = model && (await (0, _presenters.presentCollection)(undefined, model.collection));
    if (collection) {
      // For backward compatibility, set a default color.
      collection.color = collection.color ?? _collections.colorPalette[0];
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentMembership)(model),
        collection,
        user: model && (0, _presenters.presentUser)(model.user)
      }
    });
  }
  async handleCollectionGroupEvent(subscription, event) {
    const model = await _models.GroupMembership.scope(["withGroup", "withCollection"]).findOne({
      where: {
        collectionId: event.collectionId,
        groupId: event.modelId
      },
      paranoid: false
    });
    const collection = model && (await (0, _presenters.presentCollection)(undefined, model.collection));
    if (collection) {
      // For backward compatibility, set a default color.
      collection.color = collection.color ?? _collections.colorPalette[0];
    }
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentGroupMembership)(model),
        collection,
        group: model && (await (0, _presenters.presentGroup)(model.group))
      }
    });
  }
  async handleFileOperationEvent(subscription, event) {
    const model = await _models.FileOperation.findByPk(event.modelId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentFileOperation)(model)
      }
    });
  }
  async handleDocumentEvent(subscription, event) {
    const model = await _models.Document.findByPk(event.documentId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.documentId,
        model: model && (await (0, _presenters.presentDocument)(undefined, model, {
          includeData: true,
          includeText: true
        }))
      }
    });
  }
  async handleDocumentUserEvent(subscription, event) {
    const model = await _models.UserMembership.scope(["withUser", "withDocument"]).findOne({
      where: {
        documentId: event.documentId,
        userId: event.userId
      },
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentMembership)(model),
        document: model && (await (0, _presenters.presentDocument)(undefined, model.document, {
          includeData: true,
          includeText: true
        })),
        user: model && (0, _presenters.presentUser)(model.user)
      }
    });
  }
  async handleDocumentGroupEvent(subscription, event) {
    const model = await _models.GroupMembership.scope(["withGroup", "withDocument"]).findOne({
      where: {
        documentId: event.documentId,
        groupId: event.modelId
      },
      paranoid: false
    });
    const document = model && (await (0, _presenters.presentDocument)(undefined, model.document));
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: model && (0, _presenters.presentGroupMembership)(model),
        document,
        group: model && (await (0, _presenters.presentGroup)(model.group))
      }
    });
  }
  async handleRevisionEvent(subscription, event) {
    const [model, document] = await Promise.all([_models.Revision.findByPk(event.modelId, {
      paranoid: false
    }), _models.Document.findByPk(event.documentId, {
      paranoid: false
    })]);
    const data = {
      ...(model ? await (0, _presenters.presentRevision)(model) : {}),
      collectionId: document ? document.collectionId : undefined
    };
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.modelId,
        model: data
      }
    });
  }
  async handleUserEvent(subscription, event) {
    const model = await _models.User.findByPk(event.userId, {
      paranoid: false
    });
    await this.sendWebhook({
      event,
      subscription,
      payload: {
        id: event.userId,
        model: model && (0, _presenters.presentUser)(model)
      }
    });
  }
  async sendWebhook(_ref2) {
    let {
      event,
      subscription,
      payload
    } = _ref2;
    const delivery = await _models.WebhookDelivery.create({
      webhookSubscriptionId: subscription.id,
      status: "pending"
    });
    let response, requestBody, requestHeaders;
    let status;
    try {
      requestBody = (0, _webhook.default)({
        event,
        delivery,
        payload
      });
      requestHeaders = {
        "Content-Type": "application/json",
        "user-agent": `Outline-Webhooks${_env.default.VERSION ? `/${_env.default.VERSION.slice(0, 7)}` : ""}`
      };
      const signature = subscription.signature(JSON.stringify(requestBody));
      if (signature) {
        requestHeaders["Outline-Signature"] = signature;
      }
      response = await (0, _fetch.default)(subscription.url, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        redirect: "error",
        timeout: 5000
      });
      status = response.ok ? "success" : "failed";
    } catch (err) {
      if (err instanceof _nodeFetch.FetchError && _env.default.isCloudHosted) {
        _Logger.default.warn(`Failed to send webhook: ${err.message}`, {
          event,
          deliveryId: delivery.id
        });
      } else {
        _Logger.default.error("Failed to send webhook", err, {
          event,
          deliveryId: delivery.id
        });
      }
      status = "failed";
    }
    await delivery.update({
      status,
      statusCode: response ? response.status : null,
      requestBody,
      requestHeaders,
      responseBody: response ? await response.text() : "",
      responseHeaders: response ? Object.fromEntries(response.headers.entries()) : {}
    });
    if (status === "failed") {
      try {
        await this.checkAndDisableSubscription(subscription);
      } catch (err) {
        _Logger.default.error("Failed to check and disable recent deliveries", err, {
          event,
          deliveryId: delivery.id
        });
      }
    }
  }
  async checkAndDisableSubscription(subscription) {
    const recentDeliveries = await _models.WebhookDelivery.findAll({
      where: {
        webhookSubscriptionId: subscription.id
      },
      order: [["createdAt", "DESC"]],
      limit: 25
    });
    const allFailed = recentDeliveries.every(delivery => delivery.status === "failed");
    if (recentDeliveries.length === 25 && allFailed) {
      // If the last 25 deliveries failed, disable the subscription
      await subscription.disable();

      // Send an email to the creator of the webhook to let them know
      const [createdBy, team] = await Promise.all([_models.User.findOne({
        where: {
          id: subscription.createdById,
          suspendedAt: {
            [_sequelize.Op.is]: null
          }
        }
      }), subscription.$get("team")]);
      if (createdBy && team) {
        await new _WebhookDisabledEmail.default({
          to: createdBy.email,
          teamUrl: team.url,
          webhookName: subscription.name
        }).schedule();
      }
    }
  }
}
exports.default = DeliverWebhookTask;