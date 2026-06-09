"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsersUpdateSchema = exports.UsersUpdateEmailSchema = exports.UsersUpdateEmailConfirmSchema = exports.UsersSuspendSchema = exports.UsersResendInviteSchema = exports.UsersPromoteSchema = exports.UsersNotificationsUnsubscribeSchema = exports.UsersNotificationsSubscribeSchema = exports.UsersListSchema = exports.UsersInviteSchema = exports.UsersInfoSchema = exports.UsersDemoteSchema = exports.UsersDeleteSchema = exports.UsersChangeRoleSchema = exports.UsersActivateSchema = void 0;
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _date = require("./../../../../shared/utils/date");
var _User = _interopRequireDefault(require("./../../../models/User"));
var _zod2 = require("./../../../utils/zod");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const BaseIdSchema = _zod.z.object({
  id: _zod.z.string().uuid()
});
const UsersListSchema = exports.UsersListSchema = _zod.z.object({
  body: _zod.z.object({
    /** Users sorting direction */
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val),
    /** Users sorting column */
    sort: _zod.z.string().refine(val => Object.keys(_User.default.getAttributes()).includes(val), {
      message: "Invalid sort parameter"
    }).default("createdAt"),
    ids: _zod.z.array(_zod.z.string().uuid()).optional(),
    emails: _zod.z.array(_zod.z.string().email()).optional(),
    query: _zod.z.string().optional(),
    /** The user's role */
    role: _zod.z.nativeEnum(_types.UserRole).optional(),
    /**
     * Filter the users by their status – passing a user role is deprecated here, instead use the
     * `role` parameter, which will allow filtering by role and status, eg invited members, or
     * suspended admins.
     *
     * @deprecated
     */
    filter: _zod.z.enum(["invited", "viewers", "admins", "members", "active", "all", "suspended"]).optional()
  })
});
const UsersNotificationsSubscribeSchema = exports.UsersNotificationsSubscribeSchema = _zod.z.object({
  body: _zod.z.object({
    eventType: _zod.z.nativeEnum(_types.NotificationEventType)
  })
});
const UsersNotificationsUnsubscribeSchema = exports.UsersNotificationsUnsubscribeSchema = _zod.z.object({
  body: _zod.z.object({
    eventType: _zod.z.nativeEnum(_types.NotificationEventType)
  })
});
const UsersUpdateSchema = exports.UsersUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional(),
    name: _zod.z.string().optional(),
    avatarUrl: _zod.z.string().nullish(),
    language: (0, _zod2.zodEnumFromObjectKeys)(_date.locales).optional(),
    preferences: _zod.z.record(_zod.z.nativeEnum(_types.UserPreference), _zod.z.boolean()).optional(),
    timezone: (0, _zod2.zodTimezone)().optional()
  })
});
const UsersDeleteSchema = exports.UsersDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    code: _zod.z.string().optional(),
    id: _zod.z.string().uuid().optional()
  })
});
const UsersUpdateEmailSchema = exports.UsersUpdateEmailSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional(),
    email: _zod.z.string().email()
  })
});
const UsersUpdateEmailConfirmSchema = exports.UsersUpdateEmailConfirmSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    code: _zod.z.string(),
    follow: _zod.z.string().default("")
  })
});
const UsersInfoSchema = exports.UsersInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid().optional()
  })
});
const UsersActivateSchema = exports.UsersActivateSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const UsersChangeRoleSchema = exports.UsersChangeRoleSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    role: _zod.z.nativeEnum(_types.UserRole)
  })
});
const UsersPromoteSchema = exports.UsersPromoteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const UsersDemoteSchema = exports.UsersDemoteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema.extend({
    to: _zod.z.nativeEnum(_types.UserRole).default(_types.UserRole.Member)
  })
});
const UsersSuspendSchema = exports.UsersSuspendSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const UsersResendInviteSchema = exports.UsersResendInviteSchema = _schema.BaseSchema.extend({
  body: BaseIdSchema
});
const UsersInviteSchema = exports.UsersInviteSchema = _zod.z.object({
  body: _zod.z.object({
    invites: _zod.z.array(_zod.z.object({
      email: _zod.z.string().email(),
      name: _zod.z.string(),
      role: _zod.z.nativeEnum(_types.UserRole)
    }))
  })
});