"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = coalesceBody;
// remove after https://github.com/koajs/koa-body/issues/218 is resolved
function coalesceBody() {
  return function coalesceBodyMiddleware(ctx, next) {
    if (!ctx.request.body) {
      ctx.request.body = {};
    }
    return next();
  };
}