"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multipart;
var _files = require("./../../shared/utils/files");
var _errors = require("./../errors");
var _koa = require("./../utils/koa");
function multipart(_ref) {
  let {
    maximumFileSize
  } = _ref;
  return async function multipartMiddleware(ctx, next) {
    if (!ctx.is("multipart/form-data")) {
      ctx.throw((0, _errors.InvalidRequestError)("Request type must be multipart/form-data"));
    }
    const file = (0, _koa.getFileFromRequest)(ctx.request);
    if (!file) {
      ctx.throw((0, _errors.InvalidRequestError)("Request must include a file parameter"));
    }
    if (file.size > maximumFileSize) {
      ctx.throw((0, _errors.InvalidRequestError)(`The selected file was larger than the ${(0, _files.bytesToHumanReadable)(maximumFileSize)} maximum size`));
    }
    ctx.input = {
      ...(ctx.input ?? {}),
      file
    };
    return next();
  };
}