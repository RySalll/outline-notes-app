"use strict";

var _invariant = _interopRequireDefault(require("invariant"));
var _filter = _interopRequireDefault(require("lodash/filter"));
var _types = require("./../../shared/types");
var _models = require("./../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
(0, _cancan.allow)(_models.User, "createDocument", _models.Team, (actor, document) => (0, _utils.and)(
//
!actor.isGuest, !actor.isViewer, (0, _utils.isTeamModel)(actor, document), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "read", _models.Document, (actor, document) => (0, _utils.and)((0, _utils.isTeamModel)(actor, document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Read, _types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _utils.and)(!!document?.isDraft, actor.id === document?.createdById), (0, _utils.and)(!!document?.isWorkspaceTemplate, (0, _cancan.can)(actor, "readTemplate", actor.team)), (0, _cancan.can)(actor, "readDocument", document?.collection))));
(0, _cancan.allow)(_models.User, ["listRevisions", "listViews"], _models.Document, (actor, document) => (0, _utils.or)((0, _utils.and)((0, _cancan.can)(actor, "read", document), !actor.isGuest), (0, _utils.and)((0, _cancan.can)(actor, "update", document), actor.isGuest)));
(0, _cancan.allow)(_models.User, "download", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "read", document), (0, _utils.or)((0, _utils.and)(!actor.isGuest, !actor.isViewer), !!actor.team.getPreference(_types.TeamPreference.ViewersCanExport))));
(0, _cancan.allow)(_models.User, "comment", _models.Document, (actor, document) => (0, _utils.and)(
// TODO: We'll introduce a separate permission for commenting
(0, _utils.or)((0, _utils.and)((0, _cancan.can)(actor, "read", document), !actor.isGuest), (0, _utils.and)((0, _cancan.can)(actor, "update", document), actor.isGuest)), (0, _utils.isTeamMutable)(actor), !!document?.isActive, !document?.template));
(0, _cancan.allow)(_models.User, ["star", "unstar", "subscribe", "unsubscribe"], _models.Document, (actor, document) => (0, _utils.and)(
//
(0, _cancan.can)(actor, "read", document), !document?.template));
(0, _cancan.allow)(_models.User, "share", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "read", document), (0, _utils.isTeamMutable)(actor), !!document?.isActive, !document?.template, (0, _utils.or)(!document?.collection, (0, _cancan.can)(actor, "share", document?.collection))));
(0, _cancan.allow)(_models.User, "update", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "read", document), (0, _utils.isTeamMutable)(actor), !!document?.isActive, (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _utils.or)((0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById), (0, _utils.and)(!!document?.isWorkspaceTemplate, (0, _utils.or)(actor.id === document?.createdById, (0, _cancan.can)(actor, "updateTemplate", actor.team)))))));
(0, _cancan.allow)(_models.User, "publish", _models.Document, (actor, document) => (0, _utils.and)(
//
(0, _cancan.can)(actor, "update", document), !!document?.isDraft));
(0, _cancan.allow)(_models.User, "manageUsers", _models.Document, (actor, document) => (0, _utils.and)(!document?.template, (0, _cancan.can)(actor, "update", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection), !!document?.isDraft && actor.id === document?.createdById)));
(0, _cancan.allow)(_models.User, "duplicate", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "update", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection), !!document?.isDraft && actor.id === document?.createdById, (0, _utils.and)(!!document?.isWorkspaceTemplate, (0, _utils.or)(actor.id === document?.createdById, (0, _cancan.can)(actor, "updateTemplate", actor.team))))));
(0, _cancan.allow)(_models.User, "move", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "update", document), (0, _utils.or)((0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById), (0, _utils.and)(!!document?.isWorkspaceTemplate, (0, _utils.or)(actor.id === document?.createdById, (0, _cancan.can)(actor, "updateTemplate", actor.team))))));
(0, _cancan.allow)(_models.User, "createChildDocument", _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "update", document), !document?.isDraft, !document?.template));
(0, _cancan.allow)(_models.User, ["updateInsights", "pin", "unpin"], _models.Document, (actor, document) => (0, _utils.and)((0, _cancan.can)(actor, "update", document), (0, _cancan.can)(actor, "update", document?.collection), !document?.isDraft, !document?.template, !actor.isGuest));
(0, _cancan.allow)(_models.User, "pinToHome", _models.Document, (actor, document) => (0, _utils.and)(
//
(0, _utils.isTeamAdmin)(actor, document), (0, _utils.isTeamMutable)(actor), !document?.isDraft, !document?.template, !!document?.isActive));
(0, _cancan.allow)(_models.User, "delete", _models.Document, (actor, document) => (0, _utils.and)((0, _utils.isTeamModel)(actor, document), (0, _utils.isTeamMutable)(actor), !document?.isDeleted, (0, _utils.or)((0, _cancan.can)(actor, "unarchive", document), (0, _cancan.can)(actor, "update", document), (0, _utils.and)(!document?.isWorkspaceTemplate, !document?.collection))));
(0, _cancan.allow)(_models.User, ["restore", "permanentDelete"], _models.Document, (actor, document) => (0, _utils.and)((0, _utils.isTeamModel)(actor, document), !actor.isGuest, !!document?.isDeleted, (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById), (0, _utils.and)(!!document?.isWorkspaceTemplate, (0, _cancan.can)(actor, "updateTemplate", actor.team)), !document?.collection)));
(0, _cancan.allow)(_models.User, "archive", _models.Document, (actor, document) => (0, _utils.and)(!document?.template, !document?.isDraft, !!document?.isActive, (0, _cancan.can)(actor, "update", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection))));
(0, _cancan.allow)(_models.User, "unarchive", _models.Document, (actor, document) => (0, _utils.and)(!document?.template, !document?.isDraft, !document?.isDeleted, !!document?.archivedAt, (0, _cancan.can)(actor, "read", document), (0, _utils.or)(includesMembership(document, [_types.DocumentPermission.ReadWrite, _types.DocumentPermission.Admin]), (0, _cancan.can)(actor, "updateDocument", document?.collection), (0, _utils.and)(!!document?.isDraft && actor.id === document?.createdById))));
(0, _cancan.allow)(_models.Document, "restore", _models.Revision, (document, revision) => document.id === revision?.documentId);
(0, _cancan.allow)(_models.User, "unpublish", _models.Document, (user, document) => {
  if (!document || user.isGuest || user.isViewer || !document.isActive || document.isDraft) {
    return false;
  }
  if (document.isWorkspaceTemplate && (user.id === document.createdById || (0, _cancan.can)(user, "updateTemplate", user.team))) {
    return true;
  }
  (0, _invariant.default)(document.collection, "collection is missing, did you forget to include in the query scope?");
  if ((0, _cancan.cannot)(user, "updateDocument", document.collection)) {
    return false;
  }
  return user.teamId === document.teamId;
});
function includesMembership(document, permissions) {
  if (!document) {
    return false;
  }
  (0, _invariant.default)(document.memberships, "Development: document memberships should be preloaded, did you forget withMembership scope?");
  (0, _invariant.default)(document.groupMemberships, "Development: document groupMemberships should be preloaded, did you forget withMembership scope?");
  const membershipIds = (0, _filter.default)([...document.memberships, ...document.groupMemberships], m => permissions.includes(m.permission)).map(m => m.id);
  return membershipIds.length > 0 ? membershipIds : false;
}