"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HooksUnfurlSchema = exports.HooksSlackCommandSchema = exports.HooksInteractiveSchema = void 0;
var _zod = require("zod");
const HooksUnfurlSchema = exports.HooksUnfurlSchema = _zod.z.object({
  body: _zod.z.object({
    challenge: _zod.z.string()
  }).or(_zod.z.object({
    token: _zod.z.string(),
    team_id: _zod.z.string(),
    event: _zod.z.object({
      channel: _zod.z.string(),
      message_ts: _zod.z.string(),
      links: _zod.z.array(_zod.z.object({
        url: _zod.z.string()
      })),
      user: _zod.z.string()
    })
  }))
});
const HooksSlackCommandSchema = exports.HooksSlackCommandSchema = _zod.z.object({
  body: _zod.z.object({
    token: _zod.z.string(),
    team_id: _zod.z.string(),
    user_id: _zod.z.string(),
    text: _zod.z.string().optional().default("")
  })
});
const HooksInteractiveSchema = exports.HooksInteractiveSchema = _zod.z.object({
  body: _zod.z.object({
    payload: _zod.z.string()
  })
});