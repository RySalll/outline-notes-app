"use strict";

var _invariant = _interopRequireDefault(require("invariant"));
var _filter = _interopRequireDefault(require("lodash/filter"));
var _types = require("./../../shared/types");
var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
(0, _cancan.allow)(_models.User, "createCollection", _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamModel)(actor, team), (0, _utils.isTeamMutable)(actor), !actor.isGuest, !actor.isViewer, (0, _utils.or)(actor.isAdmin, !!team?.memberCollectionCreate)));
(0, _cancan.allow)(_models.User, "importCollection", _models.Team, (actor, team) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "move", _models.Collection, (actor, collection) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, collection), (0, _utils.isTeamMutable)(actor), !!collection?.isActive));
(0, _cancan.allow)(_models.User, "read", _models.Collection, (user, collection) => {
  if (!collection || user.teamId !== collection.teamId) {
    return false;
  }
  if (user.isAdmin) {
    return true;
  }
  if (collection.isPrivate || user.isGuest) {
    return includesMembership(collection, Object.values(_types.CollectionPermission));
  }
  return true;
});
(0, _cancan.allow)(_models.User, ["readDocument", "star", "unstar"], _models.Collection, (user, collection) => {
  if (!collection || user.teamId !== collection.teamId) {
    return false;
  }
  if (collection.isPrivate || user.isGuest) {
    return includesMembership(collection, Object.values(_types.CollectionPermission));
  }
  return true;
});
(0, _cancan.allow)(_models.User, "export", _models.Collection, (actor, collection) => (0, _utils.and)(
//
(0, _cancan.can)(actor, "read", collection), !actor.isViewer, !actor.isGuest));
(0, _cancan.allow)(_models.User, "share", _models.Collection, (user, collection) => {
  if (!collection || user.isGuest || user.teamId !== collection.teamId || !(0, _utils.isTeamMutable)(user)) {
    return false;
  }
  if (!collection.sharing) {
    return false;
  }
  if (!collection.isPrivate && user.isAdmin) {
    return true;
  }
  if (collection.permission !== _types.CollectionPermission.ReadWrite || user.isViewer) {
    return includesMembership(collection, [_types.CollectionPermission.ReadWrite, _types.CollectionPermission.Admin]);
  }
  return true;
});
(0, _cancan.allow)(_models.User, "updateDocument", _models.Collection, (user, collection) => {
  if (!collection || !(0, _utils.isTeamModel)(user, collection) || !(0, _utils.isTeamMutable)(user)) {
    return false;
  }
  if (!collection.isPrivate && user.isAdmin) {
    return true;
  }
  if (collection.permission !== _types.CollectionPermission.ReadWrite || user.isViewer || user.isGuest) {
    return includesMembership(collection, [_types.CollectionPermission.ReadWrite, _types.CollectionPermission.Admin]);
  }
  return true;
});
(0, _cancan.allow)(_models.User, ["createDocument", "deleteDocument"], _models.Collection, (user, collection) => {
  if (!collection || !collection.isActive || !(0, _utils.isTeamModel)(user, collection) || !(0, _utils.isTeamMutable)(user)) {
    return false;
  }
  if (!collection.isPrivate && user.isAdmin) {
    return true;
  }
  if (collection.permission !== _types.CollectionPermission.ReadWrite || user.isViewer || user.isGuest) {
    return includesMembership(collection, [_types.CollectionPermission.ReadWrite, _types.CollectionPermission.Admin]);
  }
  return true;
});
(0, _cancan.allow)(_models.User, ["update", "archive"], _models.Collection, (user, collection) => (0, _utils.and)(!!collection, !!collection?.isActive, (0, _utils.or)((0, _utils.isTeamAdmin)(user, collection), includesMembership(collection, [_types.CollectionPermission.Admin]))));
(0, _cancan.allow)(_models.User, "delete", _models.Collection, (user, collection) => (0, _utils.and)(!!collection, !collection?.deletedAt, (0, _utils.or)((0, _utils.isTeamAdmin)(user, collection), includesMembership(collection, [_types.CollectionPermission.Admin]))));
(0, _cancan.allow)(_models.User, "restore", _models.Collection, (user, collection) => (0, _utils.and)(!!collection, !collection?.isActive, (0, _utils.or)((0, _utils.isTeamAdmin)(user, collection), includesMembership(collection, [_types.CollectionPermission.Admin]))));
function includesMembership(collection, permissions) {
  if (!collection) {
    return false;
  }
  (0, _invariant.default)(collection.memberships, "Development: collection memberships not preloaded, did you forget `withMembership` scope?");
  (0, _invariant.default)(collection.groupMemberships, "Development: collection groupMemberships not preloaded, did you forget `withMembership` scope?");
  const membershipIds = (0, _filter.default)([...collection.memberships, ...collection.groupMemberships], m => permissions.includes(m.permission)).map(m => m.id);
  return membershipIds.length > 0 ? membershipIds : false;
}