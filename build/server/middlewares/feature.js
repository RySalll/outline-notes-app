"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.feature = feature;
var _errors = require("./../errors");
/**
 * Middleware to check if a feature is enabled for the team.
 *
 * @param preference The preference to check
 * @returns The middleware function
 */
function feature(preference) {
  return async function featureEnabledMiddleware(ctx, next) {
    if (!ctx.state.auth.user.team.getPreference(preference)) {
      throw (0, _errors.ValidationError)(`${preference} is currently disabled`);
    }
    return next();
  };
}