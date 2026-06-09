"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebhookSubscriptionsUpdateSchema = exports.WebhookSubscriptionsDeleteSchema = exports.WebhookSubscriptionsCreateSchema = void 0;
var _zod = require("zod");
const WebhookSubscriptionsCreateSchema = exports.WebhookSubscriptionsCreateSchema = _zod.z.object({
  body: _zod.z.object({
    name: _zod.z.string(),
    url: _zod.z.string().url(),
    secret: _zod.z.string().optional(),
    events: _zod.z.array(_zod.z.string())
  })
});
const WebhookSubscriptionsUpdateSchema = exports.WebhookSubscriptionsUpdateSchema = _zod.z.object({
  body: _zod.z.object({
    id: _zod.z.string().uuid(),
    name: _zod.z.string(),
    url: _zod.z.string().url(),
    secret: _zod.z.string().optional(),
    events: _zod.z.array(_zod.z.string())
  })
});
const WebhookSubscriptionsDeleteSchema = exports.WebhookSubscriptionsDeleteSchema = _zod.z.object({
  body: _zod.z.object({
    id: _zod.z.string().uuid()
  })
});