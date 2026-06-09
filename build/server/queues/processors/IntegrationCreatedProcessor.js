"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("./../../../shared/types");
var _models = require("./../../models");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
var _CacheHelper = require("./../../utils/CacheHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class IntegrationCreatedProcessor extends _BaseProcessor.default {
  async perform(event) {
    const integration = await _models.Integration.findOne({
      where: {
        id: event.modelId
      },
      paranoid: false
    });
    if (integration?.type !== _types.IntegrationType.Embed) {
      return;
    }

    // Clear the cache of unfurled data for the team as it may be stale now.
    await _CacheHelper.CacheHelper.clearData(_CacheHelper.CacheHelper.getUnfurlKey(integration.teamId));
  }
}
exports.default = IntegrationCreatedProcessor;
_defineProperty(IntegrationCreatedProcessor, "applicableEvents", ["integrations.create"]);