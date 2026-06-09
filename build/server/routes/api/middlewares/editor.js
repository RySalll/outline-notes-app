"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = editor;
var _semver = _interopRequireDefault(require("semver"));
var _version = _interopRequireDefault(require("./../../../../shared/editor/version"));
var _errors = require("./../../../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function editor() {
  return async function editorMiddleware(ctx, next) {
    const clientVersion = ctx.headers["x-editor-version"];

    // If the editor version on the client is behind the current version being
    // served in production by either a minor (new features), or major (breaking
    // changes) then force a client reload.
    if (clientVersion) {
      const parsedClientVersion = _semver.default.parse(clientVersion);
      const parsedCurrentVersion = _semver.default.parse(_version.default);
      if (parsedClientVersion && parsedCurrentVersion && (parsedClientVersion.major < parsedCurrentVersion.major || parsedClientVersion.minor < parsedCurrentVersion.minor)) {
        throw (0, _errors.EditorUpdateError)();
      }
    }
    return next();
  };
}