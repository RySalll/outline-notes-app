"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventHelper = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class EventHelper {}
exports.EventHelper = EventHelper;
_defineProperty(EventHelper, "ACTIVITY_EVENTS", ["collections.create", "collections.delete", "collections.move", "collections.permission_changed", "collections.add_user", "collections.remove_user", "documents.publish", "documents.unpublish", "documents.archive", "documents.unarchive", "documents.move", "documents.delete", "documents.permanent_delete", "documents.restore", "documents.add_user", "documents.remove_user", "revisions.create", "users.create", "users.demote", "userMemberships.update"]);
_defineProperty(EventHelper, "AUDIT_EVENTS", ["api_keys.create", "api_keys.delete", "authenticationProviders.update", "collections.create", "collections.update", "collections.permission_changed", "collections.move", "collections.add_user", "collections.remove_user", "collections.add_group", "collections.remove_group", "collections.delete", "documents.create", "documents.publish", "documents.update", "documents.archive", "documents.unarchive", "documents.move", "documents.delete", "documents.permanent_delete", "documents.restore", "documents.add_user", "documents.remove_user", "documents.add_group", "documents.remove_group", "groups.create", "groups.update", "groups.delete", "pins.create", "pins.update", "pins.delete", "revisions.create", "shares.create", "shares.update", "shares.revoke", "teams.update", "users.create", "users.update", "users.signin", "users.signout", "users.promote", "users.demote", "users.invite", "users.suspend", "users.activate", "users.delete", "fileOperations.create", "fileOperations.delete", "webhookSubscriptions.create", "webhookSubscriptions.delete"]);