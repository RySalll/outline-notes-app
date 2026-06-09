"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createQueue = createQueue;
var _bull = _interopRequireDefault(require("bull"));
var _snakeCase = _interopRequireDefault(require("lodash/snakeCase"));
var _time = require("./../../shared/utils/time");
var _env = _interopRequireDefault(require("./../env"));
var _Metrics = _interopRequireDefault(require("./../logging/Metrics"));
var _redis = _interopRequireDefault(require("./../storage/redis"));
var _ShutdownHelper = _interopRequireWildcard(require("./../utils/ShutdownHelper"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable @typescript-eslint/no-misused-promises */

function createQueue(name, defaultJobOptions) {
  const prefix = `queue.${(0, _snakeCase.default)(name)}`;

  // Notes on reusing Redis connections for Bull:
  // https://github.com/OptimalBits/bull/blob/b6d530f72a774be0fd4936ddb4ad9df3b183f4b6/PATTERNS.md#reusing-redis-connections
  const queue = new _bull.default(name, {
    createClient(type) {
      switch (type) {
        case "client":
          return _redis.default.defaultClient;
        case "subscriber":
          return _redis.default.defaultSubscriber;
        case "bclient":
          return new _redis.default(_env.default.REDIS_URL, {
            maxRetriesPerRequest: null,
            connectionNameSuffix: "bull"
          });
        default:
          throw new Error(`Unexpected connection type: ${type}`);
      }
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
      ...defaultJobOptions
    }
  });
  queue.on("stalled", () => {
    _Metrics.default.increment(`${prefix}.jobs.stalled`);
  });
  queue.on("completed", () => {
    _Metrics.default.increment(`${prefix}.jobs.completed`);
  });
  queue.on("error", () => {
    _Metrics.default.increment(`${prefix}.jobs.errored`);
  });
  queue.on("failed", () => {
    _Metrics.default.increment(`${prefix}.jobs.failed`);
  });
  if (_env.default.ENVIRONMENT !== "test") {
    setInterval(async () => {
      _Metrics.default.gauge(`${prefix}.count`, await queue.count());
      _Metrics.default.gauge(`${prefix}.delayed_count`, await queue.getDelayedCount());
    }, 5 * _time.Second.ms);
  }
  _ShutdownHelper.default.add(name, _ShutdownHelper.ShutdownOrder.normal, async () => {
    await queue.close();
  });
  return queue;
}