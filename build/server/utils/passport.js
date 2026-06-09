"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StateStore = void 0;
exports.getClientFromContext = getClientFromContext;
exports.getTeamFromContext = getTeamFromContext;
exports.parseState = parseState;
exports.request = request;
var _crypto = _interopRequireDefault(require("crypto"));
var _dateFns = require("date-fns");
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _types = require("./../../shared/types");
var _domains = require("./../../shared/utils/domains");
var _env = _interopRequireDefault(require("./../env"));
var _models = require("./../models");
var _errors = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } // Allowed for trusted server<->server connections
// eslint-disable-next-line no-restricted-imports
class StateStore {
  constructor() {
    _defineProperty(this, "key", "state");
    _defineProperty(this, "store", (ctx, callback) => {
      // token is a short lived one-time pad to prevent replay attacks
      const token = _crypto.default.randomBytes(8).toString("hex");

      // We expect host to be a team subdomain, custom domain, or apex domain
      // that is passed via query param from the auth provider component.
      const clientInput = ctx.query.client?.toString();
      const client = clientInput === _types.Client.Desktop ? _types.Client.Desktop : _types.Client.Web;
      const host = ctx.query.host?.toString() || (0, _domains.parseDomain)(ctx.hostname).host;
      const state = buildState(host, token, client);
      ctx.cookies.set(this.key, state, {
        expires: (0, _dateFns.addMinutes)(new Date(), 10),
        domain: (0, _domains.getCookieDomain)(ctx.hostname, _env.default.isCloudHosted)
      });
      callback(null, token);
    });
    _defineProperty(this, "verify", (ctx, providedToken, callback) => {
      const state = ctx.cookies.get(this.key);
      if (!state) {
        return callback((0, _errors.OAuthStateMismatchError)("State not return in OAuth flow"), false, state);
      }
      const {
        token
      } = parseState(state);

      // Destroy the one-time pad token and ensure it matches
      ctx.cookies.set(this.key, "", {
        expires: (0, _dateFns.subMinutes)(new Date(), 1),
        domain: (0, _domains.getCookieDomain)(ctx.hostname, _env.default.isCloudHosted)
      });
      if (!token || token !== providedToken) {
        return callback((0, _errors.OAuthStateMismatchError)(), false, token);
      }

      // @ts-expect-error Type in library is wrong
      callback(null, true, state);
    });
  }
}
exports.StateStore = StateStore;
async function request(method, endpoint, accessToken) {
  const response = await (0, _nodeFetch.default)(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw (0, _errors.InternalError)(`Failed to parse response from ${endpoint}. Expected JSON, got: ${text}`);
  }
}
function buildState(host, token, client) {
  return [host, token, client].join("|");
}
function parseState(state) {
  const [host, token, client] = state.split("|");
  return {
    host,
    token,
    client
  };
}
function getClientFromContext(ctx) {
  const state = ctx.cookies.get("state");
  const client = state ? parseState(state).client : undefined;
  return client === _types.Client.Desktop ? _types.Client.Desktop : _types.Client.Web;
}
async function getTeamFromContext(ctx) {
  // "domain" is the domain the user came from when attempting auth
  // we use it to infer the team they intend on signing into
  const state = ctx.cookies.get("state");
  const host = state ? parseState(state).host : ctx.hostname;
  const domain = (0, _domains.parseDomain)(host);
  let team;
  if (!_env.default.isCloudHosted) {
    if (_env.default.ENVIRONMENT === "test") {
      team = await _models.Team.findOne({
        where: {
          domain: _env.default.URL
        }
      });
    } else {
      team = await _models.Team.findOne({
        order: [["createdAt", "DESC"]]
      });
    }
  } else if (ctx.state?.rootShare) {
    team = await _models.Team.findByPk(ctx.state.rootShare.teamId);
  } else if (domain.custom) {
    team = await _models.Team.findOne({
      where: {
        domain: domain.host
      }
    });
  } else if (domain.teamSubdomain) {
    team = await _models.Team.findOne({
      where: {
        subdomain: domain.teamSubdomain
      }
    });
  }
  return team;
}