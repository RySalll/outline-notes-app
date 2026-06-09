"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = apiResponse;
var _stream = _interopRequireDefault(require("stream"));
var _readableStream = require("readable-stream");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function apiResponse() {
  return async function apiResponseMiddleware(ctx, next) {
    await next();
    const ok = ctx.status < 400;
    if (typeof ctx.body === "object" && !(ctx.body instanceof _readableStream.Readable) && !(ctx.body instanceof _stream.default.Readable) && !(ctx.body instanceof Buffer)) {
      ctx.body = {
        ...ctx.body,
        status: ctx.status,
        ok
      };
    }
  };
}