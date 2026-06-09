"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = auth;
var _capitalize = _interopRequireDefault(require("lodash/capitalize"));
var _UserRoleHelper = require("./../../shared/utils/UserRoleHelper");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _tracer = _interopRequireWildcard(require("./../logging/tracer"));
var _models = require("./../models");
var _types = require("./../types");
var _jwt = require("./../utils/jwt");
var _errors = require("../errors");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function auth() {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return async function authMiddleware(ctx, next) {
    let token;
    const authorizationHeader = ctx.request.get("authorization");
    if (authorizationHeader) {
      const parts = authorizationHeader.split(" ");
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        throw (0, _errors.AuthenticationError)(`Bad Authorization header format. Format is "Authorization: Bearer <token>"`);
      }
    } else if (ctx.request.body && typeof ctx.request.body === "object" && "token" in ctx.request.body) {
      token = ctx.request.body.token;
    } else if (ctx.request.query?.token) {
      token = ctx.request.query.token;
    } else {
      token = ctx.cookies.get("accessToken");
    }
    try {
      if (!token) {
        throw (0, _errors.AuthenticationError)("Authentication required");
      }
      let user;
      let type;
      if (_models.ApiKey.match(String(token))) {
        type = _types.AuthenticationType.API;
        let apiKey;
        try {
          apiKey = await _models.ApiKey.findByToken(token);
        } catch (err) {
          throw (0, _errors.AuthenticationError)("Invalid API key");
        }
        if (!apiKey) {
          throw (0, _errors.AuthenticationError)("Invalid API key");
        }
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
          throw (0, _errors.AuthenticationError)("API key is expired");
        }
        if (!apiKey.canAccess(ctx.request.url)) {
          throw (0, _errors.AuthenticationError)("API key does not have access to this resource");
        }
        user = await _models.User.findByPk(apiKey.userId, {
          include: [{
            model: _models.Team,
            as: "team",
            required: true
          }]
        });
        if (!user) {
          throw (0, _errors.AuthenticationError)("Invalid API key");
        }
        await apiKey.updateActiveAt();
      } else {
        type = _types.AuthenticationType.APP;
        user = await (0, _jwt.getUserForJWT)(String(token));
      }
      if (user.isSuspended) {
        const suspendingAdmin = await _models.User.findOne({
          where: {
            id: user.suspendedById
          },
          paranoid: false
        });
        throw (0, _errors.UserSuspendedError)({
          adminEmail: suspendingAdmin?.email || undefined
        });
      }
      if (options.role && _UserRoleHelper.UserRoleHelper.isRoleLower(user.role, options.role)) {
        throw (0, _errors.AuthorizationError)(`${(0, _capitalize.default)(options.role)} role required`);
      }
      if (options.type && type !== options.type) {
        throw (0, _errors.AuthorizationError)(`Invalid authentication type`);
      }

      // not awaiting the promises here so that the request is not blocked
      user.updateActiveAt(ctx).catch(err => {
        _Logger.default.error("Failed to update user activeAt", err);
      });
      user.team?.updateActiveAt().catch(err => {
        _Logger.default.error("Failed to update team activeAt", err);
      });
      ctx.state.auth = {
        user,
        token: String(token),
        type
      };
      if (_tracer.default) {
        (0, _tracer.addTags)({
          "request.userId": user.id,
          "request.teamId": user.teamId,
          "request.authType": type
        }, (0, _tracer.getRootSpanFromRequestContext)(ctx));
      }
    } catch (err) {
      if (options.optional) {
        ctx.state.auth = {};
      } else {
        throw err;
      }
    }
    Object.defineProperty(ctx, "context", {
      get() {
        return {
          auth: ctx.state.auth,
          transaction: ctx.state.transaction,
          ip: ctx.request.ip
        };
      }
    });
    return next();
  };
}