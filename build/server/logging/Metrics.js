"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _datadogMetrics = _interopRequireDefault(require("datadog-metrics"));
var _env = _interopRequireDefault(require("./../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Metrics {
  constructor() {
    _defineProperty(this, "enabled", !!_env.default.DD_API_KEY);
    if (!this.enabled) {
      return;
    }
    _datadogMetrics.default.init({
      apiKey: _env.default.DD_API_KEY,
      prefix: "outline.",
      defaultTags: [`env:${process.env.DD_ENV ?? _env.default.ENVIRONMENT}`]
    });
  }
  gauge(key, value, tags) {
    if (!this.enabled) {
      return;
    }
    return _datadogMetrics.default.gauge(key, value, tags);
  }
  gaugePerInstance(key, value) {
    let tags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    if (!this.enabled) {
      return;
    }
    const instanceId = process.env.INSTANCE_ID || process.env.HEROKU_DYNO_ID || process.pid;
    return _datadogMetrics.default.gauge(key, value, [...tags, `instance:${instanceId}`]);
  }
  increment(key, _tags) {
    if (!this.enabled) {
      return;
    }
    return _datadogMetrics.default.increment(key);
  }
  flush() {
    if (!this.enabled) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      _datadogMetrics.default.flush(resolve, reject);
    });
  }
}
var _default = exports.default = new Metrics();