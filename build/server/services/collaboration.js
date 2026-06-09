"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _url = _interopRequireDefault(require("url"));
var _extensionThrottle = require("@hocuspocus/extension-throttle");
var _server = require("@hocuspocus/server");
var _ws = _interopRequireDefault(require("ws"));
var _validations = require("./../../shared/validations");
var _ConnectionLimitExtension = require("./../collaboration/ConnectionLimitExtension");
var _ViewsExtension = require("./../collaboration/ViewsExtension");
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _ShutdownHelper = _interopRequireWildcard(require("./../utils/ShutdownHelper"));
var _AuthenticationExtension = _interopRequireDefault(require("../collaboration/AuthenticationExtension"));
var _LoggerExtension = _interopRequireDefault(require("../collaboration/LoggerExtension"));
var _MetricsExtension = _interopRequireDefault(require("../collaboration/MetricsExtension"));
var _PersistenceExtension = _interopRequireDefault(require("../collaboration/PersistenceExtension"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function init(app, server, serviceNames) {
  const path = "/collaboration";
  const wss = new _ws.default.Server({
    noServer: true,
    maxPayload: _validations.DocumentValidation.maxStateLength
  });
  const hocuspocus = _server.Server.configure({
    debounce: 3000,
    timeout: 30000,
    maxDebounce: 10000,
    extensions: [new _extensionThrottle.Throttle({
      throttle: _env.default.RATE_LIMITER_COLLABORATION_REQUESTS,
      consideredSeconds: _env.default.RATE_LIMITER_DURATION_WINDOW,
      // Ban time is defined in minutes
      banTime: 5
    }), new _ConnectionLimitExtension.ConnectionLimitExtension(), new _AuthenticationExtension.default(), new _PersistenceExtension.default(), new _ViewsExtension.ViewsExtension(), new _LoggerExtension.default(), new _MetricsExtension.default()]
  });
  server.on("upgrade", function (req, socket, head) {
    if (req.url?.startsWith(path)) {
      // parse document id and close connection if not present in request
      const documentId = _url.default.parse(req.url).pathname?.replace(path, "").split("/").pop();
      if (documentId) {
        wss.handleUpgrade(req, socket, head, client => {
          // Handle websocket connection errors as soon as the client is upgraded
          client.on("error", error => {
            _Logger.default.error(`Websocket error`, error, {
              documentId
            }, req);
          });
          hocuspocus.handleConnection(client, req, documentId);
        });
        return;
      }
    }
    if (req.url?.startsWith("/realtime") && serviceNames.includes("websockets")) {
      // Nothing to do, the websockets service will handle this request
      return;
    }

    // If the collaboration service is running it will close the connection
    socket.end(`HTTP/1.1 400 Bad Request\r\n`);
  });
  _ShutdownHelper.default.add("collaboration", _ShutdownHelper.ShutdownOrder.normal, () => hocuspocus.destroy());
}