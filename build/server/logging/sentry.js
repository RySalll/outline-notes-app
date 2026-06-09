"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.requestErrorHandler = requestErrorHandler;
var Sentry = _interopRequireWildcard(require("@sentry/node"));
var _env = _interopRequireDefault(require("./../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
if (_env.default.SENTRY_DSN) {
  Sentry.init({
    dsn: _env.default.SENTRY_DSN,
    environment: _env.default.ENVIRONMENT,
    release: _env.default.RELEASE,
    maxBreadcrumbs: 0,
    ignoreErrors: [
    // These errors are expected in normal running of the application and
    // don't need to be reported.
    // Validation
    "BadRequestError", "SequelizeValidationError", "SequelizeEmptyResultError", "ValidationError", "ForbiddenError",
    // Authentication
    "UnauthorizedError", "TeamDomainRequiredError", "GmailAccountCreationError", "AuthRedirectError", "UserSuspendedError", "TooManyRequestsError"]
  });
}
function requestErrorHandler(error, ctx) {
  // we don't need to report every time a request stops to the bug tracker
  if (error.code === "EPIPE" || error.code === "ECONNRESET") {
    return;
  }
  if (_env.default.SENTRY_DSN) {
    Sentry.withScope(function (scope) {
      const requestId = ctx.headers["x-request-id"];
      if (requestId) {
        scope.setTag("request_id", requestId);
      }
      const authType = ctx.state?.auth?.type ?? undefined;
      if (authType) {
        scope.setTag("auth_type", authType);
      }
      const teamId = ctx.state?.auth?.user?.teamId ?? undefined;
      if (teamId) {
        scope.setTag("team_id", teamId);
      }
      const userId = ctx.state?.auth?.user?.id ?? undefined;
      if (userId) {
        scope.setUser({
          id: userId
        });
      }
      scope.addEventProcessor(function (event) {
        return Sentry.Handlers.parseRequest(event, ctx.request);
      });
      Sentry.captureException(error);
    });
  } else if (_env.default.ENVIRONMENT !== "test") {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
var _default = exports.default = Sentry;