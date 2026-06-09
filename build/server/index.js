"use strict";

var _env = _interopRequireDefault(require("./env"));
require("./logging/tracer");
var _http = _interopRequireDefault(require("http"));
var _https = _interopRequireDefault(require("https"));
var _koa = _interopRequireDefault(require("koa"));
var _koaHelmet = _interopRequireDefault(require("koa-helmet"));
var _koaLogger = _interopRequireDefault(require("koa-logger"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _stoppable = _interopRequireDefault(require("stoppable"));
var _throng = _interopRequireDefault(require("throng"));
var _Logger = _interopRequireDefault(require("./logging/Logger"));
var _services = _interopRequireDefault(require("./services"));
var _args = require("./utils/args");
var _ssl = require("./utils/ssl");
var _rateLimiter = require("./middlewares/rateLimiter");
var _startup = require("./utils/startup");
var _updates = require("./utils/updates");
var _onerror = _interopRequireDefault(require("./onerror"));
var _ShutdownHelper = _interopRequireWildcard(require("./utils/ShutdownHelper"));
var _database = require("./storage/database");
var _redis = _interopRequireDefault(require("./storage/redis"));
var _Metrics = _interopRequireDefault(require("./logging/Metrics"));
var _PluginManager = require("./utils/PluginManager");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable import/order */

// must come before importing any instrumented module

// The number of processes to run, defaults to the number of CPU's available
// for the web service, and 1 for collaboration during the beta period.
let webProcessCount = _env.default.WEB_CONCURRENCY;
if (_env.default.SERVICES.includes("collaboration")) {
  if (webProcessCount !== 1) {
    _Logger.default.info("lifecycle", "Note: Restricting process count to 1 due to use of collaborative service");
  }
  webProcessCount = 1;
}

// This function will only be called once in the original process
async function master() {
  await (0, _database.checkConnection)(_database.sequelize);
  await (0, _startup.checkPendingMigrations)();
  await (0, _startup.printEnv)();
  if (_env.default.TELEMETRY && _env.default.isProduction) {
    void (0, _updates.checkUpdates)();
    setInterval(_updates.checkUpdates, 24 * 3600 * 1000);
  }
}

// This function will only be called in each forked process
async function start(_id, disconnect) {
  // Ensure plugins are loaded
  _PluginManager.PluginManager.loadPlugins();

  // Find if SSL certs are available
  const ssl = (0, _ssl.getSSLOptions)();
  const useHTTPS = !!ssl.key && !!ssl.cert;

  // If a --port flag is passed then it takes priority over the env variable
  const normalizedPort = (0, _args.getArg)("port", "p") || _env.default.PORT;
  const app = new _koa.default();
  const server = (0, _stoppable.default)(useHTTPS ? _https.default.createServer(ssl, app.callback()) : _http.default.createServer(app.callback()), _ShutdownHelper.default.connectionGraceTimeout);
  const router = new _koaRouter.default();

  // install basic middleware shared by all services
  if (_env.default.DEBUG.includes("http")) {
    app.use((0, _koaLogger.default)(str => _Logger.default.info("http", str)));
  }
  app.use((0, _koaHelmet.default)());

  // catch errors in one place, automatically set status and response headers
  (0, _onerror.default)(app);

  // Apply default rate limit to all routes
  app.use((0, _rateLimiter.defaultRateLimiter)());

  /** Perform a redirect on the browser so that the user's auth cookies are included in the request. */
  app.context.redirectOnClient = function (url) {
    this.type = "text/html";
    this.body = `
<html>
<head>
<meta http-equiv="refresh" content="0;URL='${url}'"/>
</head>`;
  };

  // Add a health check endpoint to all services
  router.get("/_health", async ctx => {
    try {
      await _database.sequelize.query("SELECT 1");
    } catch (err) {
      _Logger.default.error("Database connection failed", err);
      ctx.status = 500;
      return;
    }
    try {
      await _redis.default.defaultClient.ping();
    } catch (err) {
      _Logger.default.error("Redis ping failed", err);
      ctx.status = 500;
      return;
    }
    ctx.body = "OK";
  });
  app.use(router.routes());

  // loop through requested services at startup
  for (const name of _env.default.SERVICES) {
    if (!Object.keys(_services.default).includes(name)) {
      throw new Error(`Unknown service ${name}`);
    }
    _Logger.default.info("lifecycle", `Starting ${name} service`);
    const init = _services.default[name];
    init(app, server, _env.default.SERVICES);
  }
  server.on("error", err => {
    if ("code" in err && err.code === "EADDRINUSE") {
      _Logger.default.error(`Port ${normalizedPort}  is already in use. Exiting…`, err);
      process.exit(0);
    }
    if ("code" in err && err.code === "EACCES") {
      _Logger.default.error(`Port ${normalizedPort} requires elevated privileges. Exiting…`, err);
      process.exit(0);
    }
    throw err;
  });
  server.on("listening", () => {
    const address = server.address();
    const port = address.port;
    _Logger.default.info("lifecycle", `Listening on ${useHTTPS ? "https" : "http"}://localhost:${port} / ${_env.default.URL}`);
  });
  server.listen(normalizedPort);
  server.setTimeout(_env.default.REQUEST_TIMEOUT);
  _ShutdownHelper.default.add("server", _ShutdownHelper.ShutdownOrder.last, () => new Promise((resolve, reject) => {
    // Calling stop prevents new connections from being accepted and waits for
    // existing connections to close for the grace period before forcefully
    // closing them.
    server.stop((err, gracefully) => {
      disconnect();
      if (err) {
        reject(err);
      } else {
        resolve(gracefully);
      }
    });
  }));
  _ShutdownHelper.default.add("metrics", _ShutdownHelper.ShutdownOrder.last, () => _Metrics.default.flush());

  // Handle uncaught promise rejections
  process.on("unhandledRejection", error => {
    _Logger.default.error("Unhandled promise rejection", error, {
      stack: error.stack
    });
  });

  // Handle shutdown signals
  process.once("SIGTERM", () => _ShutdownHelper.default.execute());
  process.once("SIGINT", () => _ShutdownHelper.default.execute());
}
const isWebProcess = _env.default.SERVICES.includes("web") || _env.default.SERVICES.includes("api") || _env.default.SERVICES.includes("collaboration");
void (0, _throng.default)({
  master,
  worker: start,
  count: isWebProcess ? webProcessCount : undefined
});