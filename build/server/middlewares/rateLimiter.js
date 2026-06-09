"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultRateLimiter = defaultRateLimiter;
exports.rateLimiter = rateLimiter;
var _defaults = _interopRequireDefault(require("lodash/defaults"));
var _env = _interopRequireDefault(require("./../env"));
var _errors = require("./../errors");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _Metrics = _interopRequireDefault(require("./../logging/Metrics"));
var _redis = _interopRequireDefault(require("./../storage/redis"));
var _RateLimiter = _interopRequireDefault(require("./../utils/RateLimiter"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Middleware that limits the number of requests that are allowed within a given
 * window. Should only be applied once to a server – do not use on individual
 * routes.
 *
 * @returns The middleware function.
 */
function defaultRateLimiter() {
  return async function rateLimiterMiddleware(ctx, next) {
    if (!_env.default.RATE_LIMITER_ENABLED) {
      return next();
    }
    const key = _RateLimiter.default.hasRateLimiter(ctx.path) ? `${ctx.path}:${ctx.ip}` : `${ctx.ip}`;
    const limiter = _RateLimiter.default.getRateLimiter(ctx.path);
    try {
      await limiter.consume(key);
    } catch (rateLimiterRes) {
      if (rateLimiterRes.msBeforeNext) {
        ctx.set("Retry-After", `${rateLimiterRes.msBeforeNext / 1000}`);
        ctx.set("RateLimit-Limit", `${limiter.points}`);
        ctx.set("RateLimit-Remaining", `${rateLimiterRes.remainingPoints}`);
        ctx.set("RateLimit-Reset", `${new Date(Date.now() + rateLimiterRes.msBeforeNext)}`);
        _Metrics.default.increment("rate_limit.exceeded", {
          path: ctx.path
        });
        throw (0, _errors.RateLimitExceededError)();
      } else {
        _Logger.default.error("Rate limiter error", rateLimiterRes);
      }
    }
    return next();
  };
}
/**
 * Middleware that limits the number of requests per IP address that are allowed
 * within a window, overrides default middleware when used on a route.
 *
 * @returns The middleware function.
 */
function rateLimiter(config) {
  return async function registerRateLimiterMiddleware(ctx, next) {
    if (!_env.default.RATE_LIMITER_ENABLED) {
      return next();
    }
    const fullPath = `${ctx.mountPath ?? ""}${ctx.path}`;
    if (!_RateLimiter.default.hasRateLimiter(fullPath)) {
      _RateLimiter.default.setRateLimiter(fullPath, (0, _defaults.default)({
        ...config,
        points: config.requests
      }, {
        duration: 60,
        points: _env.default.RATE_LIMITER_REQUESTS,
        keyPrefix: _RateLimiter.default.RATE_LIMITER_REDIS_KEY_PREFIX,
        storeClient: _redis.default.defaultClient
      }));
    }
    return next();
  };
}