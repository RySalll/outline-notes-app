"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _env = require("./../../../server/env");
var _Deprecated = _interopRequireDefault(require("./../../../server/models/decorators/Deprecated"));
var _Public = require("./../../../server/utils/decorators/Public");
var _environment = _interopRequireDefault(require("./../../../server/utils/environment"));
var _validators = require("./../../../server/utils/validators");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let SlackPluginEnvironment = (_dec = (0, _classValidator.IsOptional)(), _dec2 = (0, _classValidator.IsOptional)(), _dec3 = (0, _validators.CannotUseWithout)("SLACK_CLIENT_ID"), _dec4 = (0, _classValidator.IsOptional)(), _dec5 = (0, _Deprecated.default)("Use SLACK_CLIENT_SECRET instead"), _dec6 = (0, _classValidator.IsOptional)(), _dec7 = (0, _Deprecated.default)("Use SLACK_CLIENT_ID instead"), _dec8 = (0, _classValidator.IsOptional)(), _dec9 = (0, _validators.CannotUseWithout)("SLACK_CLIENT_ID"), _dec10 = (0, _classValidator.IsOptional)(), _dec11 = (0, _classValidator.IsOptional)(), _dec12 = (0, _classValidator.IsBoolean)(), _class = class SlackPluginEnvironment extends _env.Environment {
  constructor() {
    super(...arguments);
    /**
     * Slack OAuth2 client credentials. To enable authentication with Slack.
     */
    _initializerDefineProperty(this, "SLACK_CLIENT_ID", _descriptor, this);
    /**
     * Injected into the `slack-app-id` header meta tag if provided.
     */
    _initializerDefineProperty(this, "SLACK_APP_ID", _descriptor2, this);
    _initializerDefineProperty(this, "SLACK_SECRET", _descriptor3, this);
    _initializerDefineProperty(this, "SLACK_KEY", _descriptor4, this);
    _initializerDefineProperty(this, "SLACK_CLIENT_SECRET", _descriptor5, this);
    /**
     * Secret to verify webhook requests received from Slack.
     */
    _initializerDefineProperty(this, "SLACK_VERIFICATION_TOKEN", _descriptor6, this);
    /**
     * If enabled a "Post to Channel" button will be added to search result
     * messages inside of Slack. This also requires setup in Slack UI.
     */
    _initializerDefineProperty(this, "SLACK_MESSAGE_ACTIONS", _descriptor7, this);
  }
}, _descriptor = _applyDecoratedDescriptor(_class.prototype, "SLACK_CLIENT_ID", [_Public.Public, _dec], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SLACK_CLIENT_ID ?? _environment.default.SLACK_KEY);
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "SLACK_APP_ID", [_Public.Public, _dec2, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SLACK_APP_ID);
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "SLACK_SECRET", [_dec4, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SLACK_SECRET);
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "SLACK_KEY", [_dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SLACK_KEY);
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "SLACK_CLIENT_SECRET", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SLACK_CLIENT_SECRET ?? _environment.default.SLACK_SECRET);
  }
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "SLACK_VERIFICATION_TOKEN", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SLACK_VERIFICATION_TOKEN);
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "SLACK_MESSAGE_ACTIONS", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.SLACK_MESSAGE_ACTIONS ?? "false");
  }
}), _class);
var _default = exports.default = new SlackPluginEnvironment();