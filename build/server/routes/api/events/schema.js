"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventsListSchema = void 0;
var _zod = require("zod");
var _schema = require("./../schema");
const EventsListSchema = exports.EventsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Id of the user who performed the action */
    actorId: _zod.z.string().uuid().optional(),
    /** Id of the document to filter the events for */
    documentId: _zod.z.string().uuid().optional(),
    /** Id of the collection to filter the events for */
    collectionId: _zod.z.string().uuid().optional(),
    /** Whether to include audit events */
    auditLog: _zod.z.boolean().default(false),
    /** Name of the event to retrieve */
    name: _zod.z.string().optional(),
    /** The attribute to sort the events by */
    sort: _zod.z.string().refine(val => ["name", "createdAt"].includes(val)).default("createdAt"),
    /** The direction to sort the events */
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val)
  })
});