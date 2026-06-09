"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationsUpdateSchema = exports.NotificationsUpdateAllSchema = exports.NotificationsUnsubscribeSchema = exports.NotificationsPixelSchema = exports.NotificationsListSchema = exports.NotificationSettingsDeleteSchema = exports.NotificationSettingsCreateSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const NotificationSettingsCreateSchema = exports.NotificationSettingsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    eventType: _zod.z.nativeEnum(_types.NotificationEventType)
  })
});
const NotificationSettingsDeleteSchema = exports.NotificationSettingsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    eventType: _zod.z.nativeEnum(_types.NotificationEventType)
  })
});
const NotificationsUnsubscribeSchema = exports.NotificationsUnsubscribeSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    userId: _zod.z.string().uuid().optional(),
    token: _zod.z.string().optional(),
    eventType: _zod.z.nativeEnum(_types.NotificationEventType).optional()
  }),
  query: _zod.z.object({
    userId: _zod.z.string().uuid().optional(),
    token: _zod.z.string().optional(),
    eventType: _zod.z.nativeEnum(_types.NotificationEventType).optional()
  })
}).refine(req => !((0, _isEmpty.default)(req.body.userId) && (0, _isEmpty.default)(req.query.userId)), {
  message: "userId is required"
});
const NotificationsListSchema = exports.NotificationsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    eventType: _zod.z.nativeEnum(_types.NotificationEventType).nullish(),
    archived: _zod.z.boolean().nullish()
  })
});
const NotificationsUpdateSchema = exports.NotificationsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.string().uuid(),
    viewedAt: _zod.z.coerce.date().nullish(),
    archivedAt: _zod.z.coerce.date().nullish()
  })
});
const NotificationsUpdateAllSchema = exports.NotificationsUpdateAllSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    viewedAt: _zod.z.coerce.date().nullish(),
    archivedAt: _zod.z.coerce.date().nullish()
  })
});
const NotificationsPixelSchema = exports.NotificationsPixelSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    id: _zod.z.string().uuid(),
    token: _zod.z.string()
  })
});