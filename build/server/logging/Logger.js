"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _chalk = _interopRequireDefault(require("chalk"));
var _isArray = _interopRequireDefault(require("lodash/isArray"));
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _isObject = _interopRequireDefault(require("lodash/isObject"));
var _winston = _interopRequireDefault(require("winston"));
var _env = _interopRequireDefault(require("./../env"));
var _Metrics = _interopRequireDefault(require("./Metrics"));
var _sentry = _interopRequireDefault(require("./sentry"));
var _ShutdownHelper = _interopRequireDefault(require("./../utils/ShutdownHelper"));
var Tracing = _interopRequireWildcard(require("./tracer"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /* eslint-disable no-console */
class Logger {
  constructor() {
    var _this = this;
    _defineProperty(this, "output", void 0);
    /**
     * Sanitize data attached to logs and errors to remove sensitive information.
     *
     * @param input The data to sanitize
     * @returns The sanitized data
     */
    _defineProperty(this, "sanitize", function (input) {
      let level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Short circuit if we're not in production to enable easier debugging
      if (!_env.default.isProduction) {
        return input;
      }
      const sensitiveFields = ["accessToken", "refreshToken", "token", "password", "content"];
      if (level > 3) {
        return "[…]";
      }
      if ((0, _isArray.default)(input)) {
        return input.map(item => _this.sanitize(item, level + 1));
      }
      if ((0, _isObject.default)(input)) {
        const output = {
          ...input
        };
        for (const key of Object.keys(output)) {
          if ((0, _isObject.default)(output[key])) {
            output[key] = _this.sanitize(output[key], level + 1);
          } else if ((0, _isArray.default)(output[key])) {
            output[key] = output[key].map(value => _this.sanitize(value, level + 1));
          } else if (sensitiveFields.includes(key)) {
            output[key] = "[Filtered]";
          } else {
            output[key] = _this.sanitize(output[key], level + 1);
          }
        }
        return output;
      }
      return input;
    });
    this.output = _winston.default.createLogger({
      // The check for log level validity is here in addition to the ENV validation
      // as entering an incorrect LOG_LEVEL in env could otherwise prevent the
      // related error message from being displayed.
      level: ["error", "warn", "info", "http", "verbose", "debug", "silly"].includes(_env.default.LOG_LEVEL) ? _env.default.LOG_LEVEL : "info"
    });
    this.output.add(new _winston.default.transports.Console({
      format: _env.default.isProduction ? _winston.default.format.json() : _winston.default.format.combine(_winston.default.format.colorize(), _winston.default.format.printf(_ref => {
        let {
          message,
          level,
          label,
          ...extra
        } = _ref;
        return `${level}: ${label ? _chalk.default.bold("[" + label + "] ") : ""}${message} ${(0, _isEmpty.default)(extra) ? "" : JSON.stringify(extra)}`;
      }))
    }));
    if (_env.default.DEBUG && _env.default.DEBUG !== "http" && !["silly", "debug"].includes(_env.default.LOG_LEVEL)) {
      this.warn(`"DEBUG" set in configuration but the "LOG_LEVEL" configuration is filtering debug messages. To see all logging, set "LOG_LEVEL" to "debug".`);
    }
  }

  /**
   * Log information
   *
   * @param category A log message category that will be prepended
   * @param extra Arbitrary data to be logged that will appear in prod logs
   */
  info(label, message, extra) {
    this.output.info(message, {
      ...this.sanitize(extra),
      label
    });
  }

  /**
   * Debug information
   *
   * @param category A log message category that will be prepended
   * @param extra Arbitrary data to be logged that will appear in development logs
   */
  debug(label, message, extra) {
    this.output.debug(message, {
      ...this.sanitize(extra),
      label
    });
  }

  /**
   * Detailed information – for very detailed logs, more detailed than debug. "silly" is the
   * lowest priority npm log level.
   *
   * @param category A log message category that will be prepended
   * @param extra Arbitrary data to be logged that will appear in verbose logs
   */
  silly(label, message, extra) {
    this.output.silly(message, {
      ...this.sanitize(extra),
      label
    });
  }

  /**
   * Log a warning
   *
   * @param message A warning message
   * @param extra Arbitrary data to be logged that will appear in prod logs
   */
  warn(message, extra) {
    _Metrics.default.increment("logger.warning");
    if (_env.default.SENTRY_DSN) {
      _sentry.default.withScope(scope => {
        scope.setLevel("warning");
        for (const key in extra) {
          scope.setExtra(key, this.sanitize(extra[key]));
        }
        _sentry.default.captureMessage(message);
      });
    }
    if (_env.default.isProduction) {
      this.output.warn(message, this.sanitize(extra));
    } else if (extra) {
      console.warn(message, extra);
    } else {
      console.warn(message);
    }
  }

  /**
   * Report a runtime error
   *
   * @param message A description of the error
   * @param error The error that occurred
   * @param extra Arbitrary data to be logged that will appear in prod logs
   * @param request An optional request object to attach to the error
   */
  error(message, error, extra, request) {
    _Metrics.default.increment("logger.error", {
      name: error.name
    });
    Tracing.setError(error);
    if (_env.default.SENTRY_DSN) {
      _sentry.default.withScope(scope => {
        scope.setLevel("error");
        for (const key in extra) {
          scope.setExtra(key, this.sanitize(extra[key]));
        }
        if (request) {
          scope.addEventProcessor(event => _sentry.default.Handlers.parseRequest(event, request));
        }
        _sentry.default.captureException(error);
      });
    }
    if (_env.default.isProduction) {
      this.output.error(message, {
        error: error.message,
        stack: error.stack
      });
    } else {
      console.error(message);
      console.error(error);
      if (extra) {
        console.error(extra);
      }
    }
  }

  /**
   * Report a fatal error and shut down the server
   *
   * @param message A description of the error
   * @param error The error that occurred
   * @param extra Arbitrary data to be logged that will appear in prod logs
   */
  fatal(message, error, extra) {
    this.error(message, error, extra);
    void _ShutdownHelper.default.execute();
  }
}
var _default = exports.default = new Logger();