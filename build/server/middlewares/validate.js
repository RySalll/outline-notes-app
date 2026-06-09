"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validate;
var _zod = require("zod");
var _errors = require("./../errors");
function validate(schema) {
  return async function validateMiddleware(ctx, next) {
    try {
      ctx.input = {
        ...(ctx.input ?? {}),
        ...schema.parse(ctx.request)
      };
    } catch (err) {
      if (err instanceof _zod.ZodError) {
        const {
          path,
          message
        } = err.issues[0];
        const errMessage = path.length > 0 ? `${path[path.length - 1]}: ${message}` : message;
        throw (0, _errors.ValidationError)(errMessage);
      }
      ctx.throw(err);
    }
    return next();
  };
}