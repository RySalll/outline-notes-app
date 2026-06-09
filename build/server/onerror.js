"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = onerror;
var _fs = _interopRequireDefault(require("fs"));
var _http = _interopRequireDefault(require("http"));
var _path = _interopRequireDefault(require("path"));
var _formidable = _interopRequireDefault(require("formidable"));
var _escape = _interopRequireDefault(require("lodash/escape"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _snakeCase = _interopRequireDefault(require("lodash/snakeCase"));
var _sequelize = require("sequelize");
var _env = _interopRequireDefault(require("./env"));
var _errors = require("./errors");
var _sentry = require("./logging/sentry");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let errorHtmlCache;
function onerror(app) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.context.onerror = function (err) {
    // Don't do anything if there is no error, this allows you to pass `this.onerror` to node-style callbacks.
    if ((0, _isNil.default)(err)) {
      return;
    }
    err = wrapInNativeError(err);
    if (err instanceof _sequelize.ValidationError) {
      if (err.errors && err.errors[0]) {
        err = (0, _errors.ValidationError)(`${err.errors[0].message} (${err.errors[0].path})`);
      } else {
        err = (0, _errors.ValidationError)();
      }
    }

    // Client aborted errors are a 500 by default, but 499 is more appropriate
    if (err instanceof _formidable.default.errors.FormidableError) {
      if (err.internalCode === 1002) {
        err = (0, _errors.ClientClosedRequestError)();
      }
    }
    if (err.code === "ENOENT" || err instanceof _sequelize.EmptyResultError || /Not found/i.test(err.message)) {
      err = (0, _errors.NotFoundError)();
    }
    if (!(err instanceof _errors.AuthorizationError) && /Authorization error/i.test(err.message)) {
      err = (0, _errors.AuthorizationError)();
    }

    // Push only unknown and 500 status errors to sentry
    if (typeof err.status !== "number" || !_http.default.STATUS_CODES[err.status] || err.status === 500) {
      (0, _sentry.requestErrorHandler)(err, this);
      if (!(err instanceof _errors.InternalError)) {
        if (_env.default.ENVIRONMENT === "test") {
          // eslint-disable-next-line no-console
          console.error(err);
        }
        err = (0, _errors.InternalError)();
      }
    }
    const headerSent = this.headerSent || !this.writable;
    if (headerSent) {
      err.headerSent = true;
    }

    // Nothing we can do here other than delegate to the app-level handler and log.
    if (headerSent) {
      return;
    }
    this.set(err.headers);
    this.status = err.status;
    this.type = this.accepts("json", "html") || "json";
    if (this.type === "text/html") {
      this.body = readErrorFile().toString().replace(/\/\/inject-message\/\//g, (0, _escape.default)(err.message)).replace(/\/\/inject-status\/\//g, (0, _escape.default)(err.status)).replace(/\/\/inject-stack\/\//g, (0, _escape.default)(err.stack));
    } else {
      this.body = JSON.stringify({
        ok: false,
        error: (0, _snakeCase.default)(err.id),
        status: Number(err.status),
        message: String(err.message || err.name),
        data: err.errorData ?? undefined
      });
    }
    this.res.end(this.body);
  };
  return app;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapInNativeError(err) {
  // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
  // See https://github.com/koajs/koa/issues/1466
  // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
  const isNativeError = Object.prototype.toString.call(err) === "[object Error]" || err instanceof Error;
  if (isNativeError) {
    return err;
  }
  let errMsg = err;
  if (typeof err === "object") {
    try {
      errMsg = JSON.stringify(err);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  const newError = (0, _errors.InternalError)(`Non-error thrown: ${errMsg}`);
  // err maybe an object, try to copy the name, message and stack to the new error instance
  if (err) {
    if (err.name) {
      newError.name = err.name;
    }
    if (err.message) {
      newError.message = err.message;
    }
    if (err.stack) {
      newError.stack = err.stack;
    }
    if (err.status) {
      newError.status = err.status;
    }
    if (err.headers) {
      newError.headers = err.headers;
    }
  }
  return newError;
}
function readErrorFile() {
  if (_env.default.isDevelopment) {
    return _fs.default.readFileSync(_path.default.join(__dirname, "error.dev.html"));
  }
  if (_env.default.isProduction) {
    return errorHtmlCache ?? (errorHtmlCache = _fs.default.readFileSync(_path.default.join(__dirname, "error.prod.html")));
  }
  return errorHtmlCache ?? (errorHtmlCache = _fs.default.readFileSync(_path.default.join(__dirname, "static/error.dev.html")));
}