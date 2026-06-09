"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _concat = _interopRequireDefault(require("lodash/concat"));
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _uniqBy = _interopRequireDefault(require("lodash/uniqBy"));
var _models = require("./../../models");
var _policies = require("./../../policies");
var _presenters = require("./../../presenters");
var _notification = _interopRequireDefault(require("./../../presenters/notification"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class WebsocketsProcessor {
  async perform(event, socketio) {
    switch (event.name) {
      case "documents.create":
      case "documents.publish":
      case "documents.unpublish":
      case "documents.restore":
        {
          const document = await _models.Document.findByPk(event.documentId, {
            paranoid: false
          });
          if (!document) {
            return;
          }
          if (event.name === "documents.create" && document.importId) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, document);
          return socketio.to(channels).emit("entities", {
            event: event.name,
            fetchIfMissing: true,
            documentIds: [{
              id: document.id,
              updatedAt: document.updatedAt
            }],
            collectionIds: [{
              id: document.collectionId
            }]
          });
        }
      case "documents.unarchive":
        {
          const [document, srcCollection] = await Promise.all([_models.Document.findByPk(event.documentId, {
            paranoid: false
          }), _models.Collection.findByPk(event.data.sourceCollectionId, {
            paranoid: false
          })]);
          if (!document || !srcCollection) {
            return;
          }
          const documentChannels = await this.getDocumentEventChannels(event, document);
          const collectionChannels = this.getCollectionEventChannels(event, srcCollection);
          const channels = (0, _uniq.default)((0, _concat.default)(documentChannels, collectionChannels));
          return socketio.to(channels).emit("entities", {
            event: event.name,
            fetchIfMissing: true,
            documentIds: [{
              id: document.id,
              updatedAt: document.updatedAt
            }],
            collectionIds: (0, _uniqBy.default)([{
              id: document.collectionId
            }, {
              id: srcCollection.id
            }], "id")
          });
        }
      case "documents.permanent_delete":
        {
          return socketio.to(`collection-${event.collectionId}`).emit(event.name, {
            modelId: event.documentId
          });
        }
      case "documents.archive":
      case "documents.delete":
      case "documents.update":
        {
          const document = await _models.Document.findByPk(event.documentId, {
            paranoid: false
          });
          if (!document) {
            return;
          }
          const data = await (0, _presenters.presentDocument)(undefined, document);
          const channels = await this.getDocumentEventChannels(event, document);
          return socketio.to(channels).emit(event.name, data);
        }
      case "documents.move":
        {
          const documents = await _models.Document.findAll({
            where: {
              id: event.data.documentIds
            },
            paranoid: false
          });
          documents.forEach(document => {
            socketio.to(`collection-${document.collectionId}`).emit("entities", {
              event: event.name,
              documentIds: [{
                id: document.id,
                updatedAt: document.updatedAt
              }]
            });
          });
          event.data.collectionIds.forEach(collectionId => {
            socketio.to(`collection-${collectionId}`).emit("entities", {
              event: event.name,
              collectionIds: [{
                id: collectionId
              }]
            });
          });
          return;
        }
      case "documents.add_user":
        {
          const [document, membership] = await Promise.all([_models.Document.findByPk(event.documentId), _models.UserMembership.findByPk(event.modelId)]);
          if (!document || !membership) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, document);
          socketio.to(channels).emit(event.name, (0, _presenters.presentMembership)(membership));
          return;
        }
      case "documents.remove_user":
        {
          const document = await _models.Document.findByPk(event.documentId);
          if (!document) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, document);
          socketio.to([...channels, `user-${event.userId}`]).emit(event.name, {
            id: event.modelId,
            userId: event.userId,
            documentId: event.documentId
          });
          return;
        }
      case "documents.add_group":
        {
          const [document, membership] = await Promise.all([_models.Document.findByPk(event.documentId), _models.GroupMembership.findByPk(event.data.membershipId)]);
          if (!document || !membership) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, document);
          socketio.to(channels).emit(event.name, (0, _presenters.presentGroupMembership)(membership));
          return;
        }
      case "documents.remove_group":
        {
          const [document, group] = await Promise.all([_models.Document.findByPk(event.documentId), _models.Group.findByPk(event.modelId)]);
          if (!document || !group) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, document);
          socketio.to([...channels, `group-${event.modelId}`]).emit(event.name, {
            id: event.data.membershipId,
            groupId: event.modelId,
            documentId: event.documentId
          });
          return;
        }
      case "collections.create":
        {
          const collection = await _models.Collection.findByPk(event.collectionId, {
            paranoid: false
          });
          if (!collection) {
            return;
          }
          socketio.to(this.getCollectionEventChannels(event, collection)).emit(event.name, await (0, _presenters.presentCollection)(undefined, collection));
          return socketio.to(this.getCollectionEventChannels(event, collection)).emit("join", {
            event: event.name,
            collectionId: collection.id
          });
        }
      case "collections.update":
        {
          const collection = await _models.Collection.findByPk(event.collectionId, {
            paranoid: false
          });
          if (!collection) {
            return;
          }
          return socketio.to(this.getCollectionEventChannels(event, collection)).emit(event.name, await (0, _presenters.presentCollection)(undefined, collection));
        }
      case "collections.delete":
        {
          const collection = await _models.Collection.findByPk(event.collectionId, {
            paranoid: false
          });
          if (!collection) {
            return;
          }
          return socketio.to(this.getCollectionEventChannels(event, collection)).emit(event.name, {
            modelId: event.collectionId
          });
        }
      case "collections.archive":
      case "collections.restore":
        {
          const collection = await _models.Collection.findByPk(event.collectionId);
          if (!collection) {
            return;
          }
          return socketio.to(this.getCollectionEventChannels(event, collection)).emit(event.name, {
            id: event.collectionId,
            archivedAt: event.data.archivedAt
          });
        }
      case "collections.move":
        {
          return socketio.to(`collection-${event.collectionId}`).emit("collections.update_index", {
            collectionId: event.collectionId,
            index: event.data.index
          });
        }
      case "collections.add_user":
        {
          const membership = await _models.UserMembership.findByPk(event.modelId);
          if (!membership) {
            return;
          }
          // the user being added isn't yet in the websocket channel for the collection
          // so they need to be notified separately
          socketio.to(`user-${membership.userId}`).to(`collection-${membership.collectionId}`).emit(event.name, (0, _presenters.presentMembership)(membership));

          // tell any user clients to connect to the websocket channel for the collection
          socketio.to(`user-${event.userId}`).emit("join", {
            event: event.name,
            collectionId: event.collectionId
          });
          return;
        }
      case "collections.remove_user":
        {
          const [collection, user] = await Promise.all([_models.Collection.scope({
            method: ["withMembership", event.userId]
          }).findByPk(event.collectionId), _models.User.findByPk(event.userId)]);
          if (!user) {
            return;
          }
          const membership = {
            userId: event.userId,
            collectionId: event.collectionId,
            id: event.modelId
          };

          // let everyone with access to the collection know a user was removed
          socketio.to(`collection-${event.collectionId}`).emit("collections.remove_user", membership);
          if ((0, _policies.cannot)(user, "read", collection)) {
            // tell any user clients to disconnect from the websocket channel for the collection
            socketio.to(`user-${event.userId}`).emit("leave", {
              event: event.name,
              collectionId: event.collectionId
            });
          }
          return;
        }
      case "collections.add_group":
        {
          const membership = await _models.GroupMembership.findByPk(event.data.membershipId);
          if (!membership) {
            return;
          }
          socketio.to(`group-${membership.groupId}`).to(`collection-${membership.collectionId}`).emit(event.name, (0, _presenters.presentGroupMembership)(membership));
          socketio.to(`group-${membership.groupId}`).emit("join", {
            event: event.name,
            collectionId: event.collectionId
          });
          return;
        }
      case "collections.remove_group":
        {
          // let everyone with access to the collection know a group was removed
          // this includes those in the the group itself
          socketio.to(`collection-${event.collectionId}`).emit("collections.remove_group", {
            groupId: event.modelId,
            collectionId: event.collectionId,
            id: event.data.membershipId
          });
          await _models.GroupUser.findAllInBatches({
            where: {
              groupId: event.modelId
            },
            batchLimit: 100
          }, async groupUsers => {
            for (const groupUser of groupUsers) {
              const [collection, user] = await Promise.all([_models.Collection.scope({
                method: ["withMembership", groupUser.userId]
              }).findByPk(event.collectionId), _models.User.findByPk(groupUser.userId)]);
              if (!user) {
                continue;
              }
              if ((0, _policies.cannot)(user, "read", collection)) {
                // tell any user clients to disconnect from the websocket channel for the collection
                socketio.to(`user-${groupUser.userId}`).emit("leave", {
                  event: event.name,
                  collectionId: event.collectionId
                });
              }
            }
          });
          return;
        }
      case "fileOperations.create":
      case "fileOperations.update":
        {
          const fileOperation = await _models.FileOperation.findByPk(event.modelId);
          if (!fileOperation) {
            return;
          }
          return socketio.to(`user-${event.actorId}`).emit(event.name, (0, _presenters.presentFileOperation)(fileOperation));
        }
      case "pins.create":
      case "pins.update":
        {
          const pin = await _models.Pin.findByPk(event.modelId);
          if (!pin) {
            return;
          }
          return socketio.to(pin.collectionId ? `collection-${pin.collectionId}` : `team-${pin.teamId}`).emit(event.name, (0, _presenters.presentPin)(pin));
        }
      case "pins.delete":
        {
          return socketio.to(event.collectionId ? `collection-${event.collectionId}` : `team-${event.teamId}`).emit(event.name, {
            modelId: event.modelId
          });
        }
      case "comments.create":
      case "comments.update":
        {
          const comment = await _models.Comment.findByPk(event.modelId, {
            include: [{
              model: _models.Document.scope("withDrafts"),
              as: "document",
              required: true
            }]
          });
          if (!comment) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, comment.document);
          return socketio.to(channels).emit(event.name, (0, _presenters.presentComment)(comment));
        }
      case "comments.delete":
        {
          const comment = await _models.Comment.findByPk(event.modelId, {
            paranoid: false,
            include: [{
              model: _models.Document.scope("withDrafts"),
              as: "document",
              required: true
            }]
          });
          if (!comment) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, comment.document);
          return socketio.to(channels).emit(event.name, {
            modelId: event.modelId
          });
        }
      case "comments.add_reaction":
      case "comments.remove_reaction":
        {
          const comment = await _models.Comment.findByPk(event.modelId, {
            include: [{
              model: _models.Document.scope("withDrafts"),
              as: "document",
              required: true
            }]
          });
          if (!comment) {
            return;
          }
          const user = await _models.User.findByPk(event.actorId);
          if (!user) {
            return;
          }
          const channels = await this.getDocumentEventChannels(event, comment.document);
          return socketio.to(channels).emit(event.name, {
            emoji: event.data.emoji,
            commentId: event.modelId,
            user: (0, _presenters.presentUser)(user)
          });
        }
      case "notifications.create":
      case "notifications.update":
        {
          const notification = await _models.Notification.findByPk(event.modelId);
          if (!notification) {
            return;
          }
          const data = await (0, _notification.default)(undefined, notification);
          return socketio.to(`user-${event.userId}`).emit(event.name, data);
        }
      case "stars.create":
      case "stars.update":
        {
          const star = await _models.Star.findByPk(event.modelId);
          if (!star) {
            return;
          }
          return socketio.to(`user-${event.userId}`).emit(event.name, (0, _presenters.presentStar)(star));
        }
      case "stars.delete":
        {
          return socketio.to(`user-${event.userId}`).emit(event.name, {
            modelId: event.modelId
          });
        }
      case "groups.create":
      case "groups.update":
        {
          const group = await _models.Group.findByPk(event.modelId, {
            paranoid: false
          });
          if (!group) {
            return;
          }
          return socketio.to(`team-${group.teamId}`).emit(event.name, await (0, _presenters.presentGroup)(group));
        }
      case "groups.add_user":
        {
          // do an add user for every collection that the group is a part of
          const groupUser = await _models.GroupUser.findOne({
            where: {
              groupId: event.modelId,
              userId: event.userId
            }
          });
          if (!groupUser) {
            return;
          }
          socketio.to(`team-${event.teamId}`).emit("groups.add_user", (0, _presenters.presentGroupUser)(groupUser));
          socketio.to(`user-${event.userId}`).emit("join", {
            event: event.name,
            groupId: event.modelId
          });
          await _models.GroupMembership.findAllInBatches({
            where: {
              groupId: event.modelId
            },
            batchLimit: 100
          }, async groupMemberships => {
            for (const groupMembership of groupMemberships) {
              if (groupMembership.collectionId) {
                socketio.to(`user-${event.userId}`).emit("collections.add_group", (0, _presenters.presentGroupMembership)(groupMembership));

                // tell any user clients to connect to the websocket channel for the collection
                socketio.to(`user-${event.userId}`).emit("join", {
                  event: event.name,
                  collectionId: groupMembership.collectionId
                });
              }
              if (groupMembership.documentId) {
                socketio.to(`user-${event.userId}`).emit("documents.add_group", (0, _presenters.presentGroupMembership)(groupMembership));
              }
            }
          });
          return;
        }
      case "groups.remove_user":
        {
          const membership = {
            event: event.name,
            userId: event.userId,
            groupId: event.modelId
          };

          // let everyone with access to the group know a user was removed
          socketio.to(`team-${event.teamId}`).emit("groups.remove_user", membership);
          socketio.to(`user-${event.userId}`).emit("leave", {
            event: event.name,
            groupId: event.modelId
          });
          const user = await _models.User.findByPk(event.userId);
          if (!user) {
            return;
          }
          await _models.GroupMembership.findAllInBatches({
            where: {
              groupId: event.modelId
            },
            batchLimit: 100
          }, async groupMemberships => {
            for (const groupMembership of groupMemberships) {
              if (!groupMembership.collectionId) {
                continue;
              }
              socketio.to(`user-${event.userId}`).emit("collections.remove_group", (0, _presenters.presentGroupMembership)(groupMembership));
              const collection = await _models.Collection.scope({
                method: ["withMembership", event.userId]
              }).findByPk(groupMembership.collectionId);
              if ((0, _policies.cannot)(user, "read", collection)) {
                // tell any user clients to disconnect from the websocket channel for the collection
                socketio.to(`user-${event.userId}`).emit("leave", {
                  event: event.name,
                  collectionId: groupMembership.collectionId
                });
              }
            }
          });
          return;
        }
      case "groups.delete":
        {
          socketio.to(`team-${event.teamId}`).emit(event.name, {
            modelId: event.modelId
          });
          socketio.to(`group-${event.modelId}`).emit("leave", {
            event: event.name,
            groupId: event.modelId
          });
          const groupMemberships = await _models.GroupMembership.findAll({
            where: {
              groupId: event.modelId
            }
          });
          await _models.GroupUser.findAllInBatches({
            where: {
              groupId: event.modelId
            },
            include: [{
              association: "user",
              required: true
            }],
            batchLimit: 100
          }, async groupUsers => {
            for (const groupMembership of groupMemberships) {
              const payload = (0, _presenters.presentGroupMembership)(groupMembership);
              if (groupMembership.collectionId) {
                for (const groupUser of groupUsers) {
                  socketio.to(`user-${groupUser.userId}`).emit("collections.remove_group", payload);
                  const collection = await _models.Collection.scope({
                    method: ["withMembership", groupUser.userId]
                  }).findByPk(groupMembership.collectionId);
                  if ((0, _policies.cannot)(groupUser.user, "read", collection)) {
                    // tell any user clients to disconnect from the websocket channel for the collection
                    socketio.to(`user-${groupUser.userId}`).emit("leave", {
                      event: event.name,
                      collectionId: groupMembership.collectionId
                    });
                  }
                }
              }
              if (groupMembership.documentId) {
                for (const groupUser of groupUsers) {
                  socketio.to(`user-${groupUser.userId}`).emit("documents.remove_group", payload);
                }
              }
            }
          });
          return;
        }
      case "subscriptions.create":
        {
          const subscription = await _models.Subscription.findByPk(event.modelId);
          if (!subscription) {
            return;
          }
          return socketio.to(`user-${event.userId}`).emit(event.name, (0, _presenters.presentSubscription)(subscription));
        }
      case "subscriptions.delete":
        {
          return socketio.to(`user-${event.userId}`).emit(event.name, {
            modelId: event.modelId
          });
        }
      case "teams.update":
        {
          const team = await _models.Team.scope("withDomains").findByPk(event.teamId);
          if (!team) {
            return;
          }
          return socketio.to(`team-${event.teamId}`).emit(event.name, (0, _presenters.presentTeam)(team));
        }
      case "users.update":
        {
          const user = await _models.User.findByPk(event.userId);
          if (!user) {
            return;
          }
          socketio.to(`user-${event.userId}`).emit(event.name, (0, _presenters.presentUser)(user, {
            includeDetails: true
          }));
          socketio.to(`team-${user.teamId}`).emit(event.name, (0, _presenters.presentUser)(user));
          return;
        }
      case "users.demote":
        {
          return socketio.to(`user-${event.userId}`).emit(event.name, {
            id: event.userId
          });
        }
      case "userMemberships.update":
        {
          return socketio.to(`user-${event.userId}`).emit(event.name, {
            id: event.modelId,
            ...event.data
          });
        }
      default:
        return;
    }
  }
  getCollectionEventChannels(event, collection) {
    const channels = [];
    if (event.actorId) {
      channels.push(`user-${event.actorId}`);
    }
    if (collection.isPrivate) {
      channels.push(`collection-${collection.id}`);
    } else {
      channels.push(`team-${collection.teamId}`);
    }
    return channels;
  }
  async getDocumentEventChannels(event, document) {
    const channels = [];
    if (event.actorId) {
      channels.push(`user-${event.actorId}`);
    }
    if (document.publishedAt) {
      if (document.collection) {
        channels.push(...this.getCollectionEventChannels(event, document.collection));
      } else if (document.isWorkspaceTemplate) {
        channels.push(`team-${document.teamId}`);
      } else {
        channels.push(`collection-${document.collectionId}`);
      }
    }
    const [userMemberships, groupMemberships] = await Promise.all([_models.UserMembership.findAll({
      where: {
        documentId: document.id
      }
    }), _models.GroupMembership.findAll({
      where: {
        documentId: document.id
      }
    })]);
    for (const membership of userMemberships) {
      channels.push(`user-${membership.userId}`);
    }
    for (const membership of groupMemberships) {
      channels.push(`group-${membership.groupId}`);
    }
    return (0, _uniq.default)(channels);
  }
}
exports.default = WebsocketsProcessor;