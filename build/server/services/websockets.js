"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _cookie = _interopRequireDefault(require("cookie"));
var _socket = _interopRequireDefault(require("socket.io"));
var _socket2 = require("socket.io-redis");
var _errors = require("./../errors");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _Metrics = _interopRequireDefault(require("./../logging/Metrics"));
var Tracing = _interopRequireWildcard(require("./../logging/tracer"));
var _tracing = require("./../logging/tracing");
var _models = require("./../models");
var _policies = require("./../policies");
var _redis = _interopRequireDefault(require("./../storage/redis"));
var _ShutdownHelper = _interopRequireWildcard(require("./../utils/ShutdownHelper"));
var _jwt = require("./../utils/jwt");
var _queues = require("../queues");
var _WebsocketsProcessor = _interopRequireDefault(require("../queues/processors/WebsocketsProcessor"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function init(app, server, serviceNames) {
  const path = "/realtime";

  // Websockets for events and non-collaborative documents
  const io = new _socket.default.Server(server, {
    path,
    serveClient: false,
    cookie: false,
    pingInterval: 15000,
    pingTimeout: 30000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Remove the upgrade handler that we just added when registering the IO engine
  // And re-add it with a check to only handle the realtime path, this allows
  // collaboration websockets to exist in the same process as engine.io.
  const listeners = server.listeners("upgrade");
  const ioHandleUpgrade = listeners.pop();
  if (ioHandleUpgrade) {
    server.removeListener("upgrade", ioHandleUpgrade);
  }
  server.on("upgrade", function (req, socket, head) {
    if (req.url?.startsWith(path) && ioHandleUpgrade) {
      ioHandleUpgrade(req, socket, head);
      return;
    }
    if (serviceNames.includes("collaboration")) {
      // Nothing to do, the collaboration service will handle this request
      return;
    }

    // If the collaboration service isn't running then we need to close the connection
    socket.end(`HTTP/1.1 400 Bad Request\r\n`);
  });
  _ShutdownHelper.default.add("websockets", _ShutdownHelper.ShutdownOrder.normal, async () => {
    _Metrics.default.gaugePerInstance("websockets.count", 0);
  });
  io.adapter((0, _socket2.createAdapter)({
    pubClient: _redis.default.defaultClient,
    subClient: _redis.default.defaultSubscriber
  }));
  io.of("/").adapter.on("error", err => {
    if (err.name === "MaxRetriesPerRequestError") {
      _Logger.default.fatal("Redis maximum retries exceeded in socketio adapter", err);
    } else {
      _Logger.default.error("Redis error in socketio adapter", err);
    }
  });
  io.on("connection", async socket => {
    _Metrics.default.increment("websockets.connected");
    _Metrics.default.gaugePerInstance("websockets.count", io.engine.clientsCount);
    socket.on("disconnect", async () => {
      _Metrics.default.increment("websockets.disconnected");
      _Metrics.default.gaugePerInstance("websockets.count", io.engine.clientsCount);
    });
    setTimeout(function () {
      // If the socket didn't authenticate after connection, disconnect it
      if (!socket.client.user) {
        _Logger.default.debug("websockets", `Disconnecting socket ${socket.id}`);

        // @ts-expect-error should be boolean
        socket.disconnect("unauthorized");
      }
    }, 1000);
    try {
      await authenticate(socket);
      _Logger.default.debug("websockets", `Authenticated socket ${socket.id}`);
      socket.emit("authenticated", true);
      void authenticated(io, socket);
    } catch (err) {
      _Logger.default.debug("websockets", `Authentication error socket ${socket.id}`, {
        error: err.message
      });
      socket.emit("unauthorized", {
        message: err.message
      }, function () {
        socket.disconnect();
      });
    }
  });

  // Handle events from event queue that should be sent to the clients down ws
  const websockets = new _WebsocketsProcessor.default();
  _queues.websocketQueue.process((0, _tracing.traceFunction)({
    serviceName: "websockets",
    spanName: "process",
    isRoot: true
  })(async function (job) {
    const event = job.data;
    Tracing.setResource(`Processor.WebsocketsProcessor`);
    websockets.perform(event, io).catch(error => {
      _Logger.default.error("Error processing websocket event", error, {
        event
      });
    });
  })).catch(err => {
    _Logger.default.fatal("Error starting websocketQueue", err);
  });
}
async function authenticated(io, socket) {
  const {
    user
  } = socket.client;
  if (!user) {
    throw new Error("User not returned from auth");
  }

  // the rooms associated with the current team
  // and user so we can send authenticated events
  const rooms = [`team-${user.teamId}`, `user-${user.id}`];

  // the rooms associated with collections this user has access to on
  // connection. New collection and group subscriptions are managed
  // from the client as needed through the 'join' event.
  const [collectionIds, groupIds] = await Promise.all([user.collectionIds(), user.groupIds()]);
  collectionIds.forEach(colId => rooms.push(`collection-${colId}`));
  groupIds.forEach(groupId => rooms.push(`group-${groupId}`));

  // allow the client to request to join rooms
  socket.on("join", async event => {
    // user is joining a collection channel, because their permissions have
    // changed, granting them access.
    if (event.collectionId) {
      const collection = await _models.Collection.scope({
        method: ["withMembership", user.id]
      }).findByPk(event.collectionId);
      if ((0, _policies.can)(user, "read", collection)) {
        await socket.join(`collection-${event.collectionId}`);
      }
    }
    if (event.groupId) {
      const group = await _models.Group.scope({
        method: ["withMembership", user.id]
      }).findByPk(event.groupId);
      if ((0, _policies.can)(user, "read", group)) {
        await socket.join(`group-${event.groupId}`);
      }
    }
  });

  // allow the client to request to leave rooms
  socket.on("leave", async event => {
    if (event.collectionId) {
      await socket.leave(`collection-${event.collectionId}`);
    }
    if (event.groupId) {
      await socket.leave(`group-${event.groupId}`);
    }
  });

  // join all of the rooms at once
  await socket.join(rooms);
}

/**
 * Authenticate the socket with the given token, attach the user model for the
 * duration of the session.
 */
async function authenticate(socket) {
  const cookies = socket.request.headers.cookie ? _cookie.default.parse(socket.request.headers.cookie) : {};
  const {
    accessToken
  } = cookies;
  if (!accessToken) {
    throw (0, _errors.AuthenticationError)("No access token");
  }
  const user = await (0, _jwt.getUserForJWT)(accessToken);
  socket.client.user = user;
  return user;
}