"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = shareDomains;
var _sequelize = require("sequelize");
var _domains = require("./../../shared/utils/domains");
var _env = _interopRequireDefault(require("./../env"));
var _models = require("./../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function shareDomains() {
  return async function shareDomainsMiddleware(ctx, next) {
    const isCustomDomain = (0, _domains.parseDomain)(ctx.host).custom;
    if (_env.default.isDevelopment || isCustomDomain && _env.default.isCloudHosted) {
      const share = await _models.Share.unscoped().findOne({
        where: {
          domain: ctx.hostname,
          published: true,
          revokedAt: {
            [_sequelize.Op.is]: null
          }
        }
      });
      ctx.state.rootShare = share;
    }
    return next();
  };
}