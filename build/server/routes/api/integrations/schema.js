"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IntegrationsUpdateSchema = exports.IntegrationsListSchema = exports.IntegrationsInfoSchema = exports.IntegrationsDeleteSchema = exports.IntegrationsCreateSchema = void 0;
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _models = require("./../../../models");
var _schema = require("../schema");
const IntegrationsListSchema = exports.IntegrationsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Integrations sorting direction */
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val),
    /** Integrations sorting column */
    sort: _zod.z.string().refine(val => Object.keys(_models.Integration.getAttributes()).includes(val), {
      message: "Invalid sort parameter"
    }).default("updatedAt"),
    /** Integration type */
    type: _zod.z.nativeEnum(_types.IntegrationType).optional(),
    /** Integration service */
    service: _zod.z.nativeEnum(_types.IntegrationService).optional()
  })
});
const IntegrationsCreateSchema = exports.IntegrationsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Integration type */
    type: _zod.z.nativeEnum(_types.IntegrationType),
    /** Integration service */
    service: _zod.z.nativeEnum(_types.UserCreatableIntegrationService),
    /** Integration config/settings */
    settings: _zod.z.object({
      url: _zod.z.string().url()
    }).or(_zod.z.object({
      url: _zod.z.string().url(),
      channel: _zod.z.string(),
      channelId: _zod.z.string()
    })).or(_zod.z.object({
      measurementId: _zod.z.string(),
      instanceUrl: _zod.z.string().url().optional(),
      scriptName: _zod.z.string().optional()
    })).or(_zod.z.object({
      serviceTeamId: _zod.z.string()
    })).optional()
  })
});
const IntegrationsUpdateSchema = exports.IntegrationsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of integration that needs update */
    id: _zod.z.string().uuid(),
    /** Integration config/settings */
    settings: _zod.z.object({
      url: _zod.z.string().url()
    }).or(_zod.z.object({
      url: _zod.z.string().url(),
      channel: _zod.z.string(),
      channelId: _zod.z.string()
    })).or(_zod.z.object({
      measurementId: _zod.z.string(),
      instanceUrl: _zod.z.string().url().optional(),
      scriptName: _zod.z.string().optional()
    })).or(_zod.z.object({
      serviceTeamId: _zod.z.string()
    })).optional(),
    /** Integration events */
    events: _zod.z.array(_zod.z.string()).optional().default([])
  })
});
const IntegrationsInfoSchema = exports.IntegrationsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of integration to find */
    id: _zod.z.string().uuid()
  })
});
const IntegrationsDeleteSchema = exports.IntegrationsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of integration to be deleted */
    id: _zod.z.string().uuid()
  })
});