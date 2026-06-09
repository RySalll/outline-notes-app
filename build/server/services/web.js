"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _crypto = _interopRequireDefault(require("crypto"));
var _koa = _interopRequireDefault(require("koa"));
var _koaCompress = _interopRequireDefault(require("koa-compress"));
var _koaHelmet = require("koa-helmet");
var _koaMount = _interopRequireDefault(require("koa-mount"));
var _koaSslify = _interopRequireWildcard(require("koa-sslify"));
var _time = require("./../../shared/utils/time");
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _Metrics = _interopRequireDefault(require("./../logging/Metrics"));
var _ShutdownHelper = _interopRequireWildcard(require("./../utils/ShutdownHelper"));
var _i18n = require("./../utils/i18n");
var _routes = _interopRequireDefault(require("../routes"));
var _api = _interopRequireDefault(require("../routes/api"));
var _auth = _interopRequireDefault(require("../routes/auth"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable @typescript-eslint/no-var-requires */

// Construct scripts CSP based on services in use by this installation
const defaultSrc = ["'self'"];
const scriptSrc = ["'self'", "www.googletagmanager.com"];
const styleSrc = ["'self'", "'unsafe-inline'"];
if (_env.default.isCloudHosted) {
  scriptSrc.push("cdn.zapier.com");
  styleSrc.push("cdn.zapier.com");
}

// Allow to load assets from Vite
if (!_env.default.isProduction) {
  scriptSrc.push(_env.default.URL.replace(`:${_env.default.PORT}`, ":3001"));
  scriptSrc.push("localhost:3001");
}
if (_env.default.GOOGLE_ANALYTICS_ID) {
  scriptSrc.push("www.google-analytics.com");
}
if (_env.default.CDN_URL) {
  scriptSrc.push(_env.default.CDN_URL);
  styleSrc.push(_env.default.CDN_URL);
  defaultSrc.push(_env.default.CDN_URL);
}
function init() {
  let app = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _koa.default();
  let server = arguments.length > 1 ? arguments[1] : undefined;
  void (0, _i18n.initI18n)();
  if (_env.default.isProduction) {
    // Force redirect to HTTPS protocol unless explicitly disabled
    if (_env.default.FORCE_HTTPS) {
      app.use((0, _koaSslify.default)({
        resolver: ctx => {
          if ((0, _koaSslify.httpsResolver)(ctx)) {
            return true;
          }
          return (0, _koaSslify.xForwardedProtoResolver)(ctx);
        }
      }));
    } else {
      _Logger.default.warn("Enforced https was disabled with FORCE_HTTPS env variable");
    }

    // trust header fields set by our proxy. eg X-Forwarded-For
    app.proxy = true;
  }
  app.use((0, _koaCompress.default)());
  app.use((0, _koaMount.default)("/auth", _auth.default));
  app.use((0, _koaMount.default)("/api", _api.default));

  // Monitor server connections
  if (server) {
    setInterval(() => {
      server.getConnections((err, count) => {
        if (err) {
          return;
        }
        _Metrics.default.gaugePerInstance("connections.count", count);
      });
    }, 5 * _time.Second.ms);
  }
  _ShutdownHelper.default.add("connections", _ShutdownHelper.ShutdownOrder.normal, async () => {
    _Metrics.default.gaugePerInstance("connections.count", 0);
  });

  // Sets common security headers by default, such as no-sniff, hsts, hide powered
  // by etc, these are applied after auth and api so they are only returned on
  // standard non-XHR accessed routes
  app.use((ctx, next) => {
    ctx.state.cspNonce = _crypto.default.randomBytes(16).toString("hex");
    return (0, _koaHelmet.contentSecurityPolicy)({
      directives: {
        defaultSrc,
        styleSrc,
        scriptSrc: [...scriptSrc, _env.default.DEVELOPMENT_UNSAFE_INLINE_CSP ? "'unsafe-inline'" : `'nonce-${ctx.state.cspNonce}'`],
        mediaSrc: ["*", "data:", "blob:"],
        imgSrc: ["*", "data:", "blob:"],
        frameSrc: ["*", "data:"],
        // Do not use connect-src: because self + websockets does not work in
        // Safari, ref: https://bugs.webkit.org/show_bug.cgi?id=201591
        connectSrc: ["*"]
      }
    })(ctx, next);
  });

  // Allow DNS prefetching for performance, we do not care about leaking requests
  // to our own CDN's
  app.use((0, _koaHelmet.dnsPrefetchControl)({
    allow: true
  }));
  app.use((0, _koaHelmet.referrerPolicy)({
    policy: "no-referrer"
  }));
  app.use((0, _koaMount.default)(_routes.default));
  return app;
}