"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _env = require("./../../../server/env");
var _Public = require("./../../../server/utils/decorators/Public");
var _environment = _interopRequireDefault(require("./../../../server/utils/environment"));
var _validators = require("./../../../server/utils/validators");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let OIDCPluginEnvironment = (_dec = (0, _classValidator.IsOptional)(), _dec2 = (0, _validators.CannotUseWithout)("OIDC_CLIENT_SECRET"), _dec3 = (0, _validators.CannotUseWithout)("OIDC_AUTH_URI"), _dec4 = (0, _validators.CannotUseWithout)("OIDC_TOKEN_URI"), _dec5 = (0, _validators.CannotUseWithout)("OIDC_USERINFO_URI"), _dec6 = (0, _validators.CannotUseWithout)("OIDC_DISPLAY_NAME"), _dec7 = (0, _classValidator.IsOptional)(), _dec8 = (0, _validators.CannotUseWithout)("OIDC_CLIENT_ID"), _dec9 = (0, _classValidator.MaxLength)(50), _dec10 = (0, _classValidator.IsOptional)(), _dec11 = (0, _classValidator.IsUrl)({
  require_tld: false,
  allow_underscores: true
}), _dec12 = (0, _classValidator.IsOptional)(), _dec13 = (0, _classValidator.IsUrl)({
  require_tld: false,
  allow_underscores: true
}), _dec14 = (0, _classValidator.IsOptional)(), _dec15 = (0, _classValidator.IsUrl)({
  require_tld: false,
  allow_underscores: true
}), _dec16 = (0, _classValidator.IsOptional)(), _dec17 = (0, _classValidator.IsBoolean)(), _dec18 = (0, _classValidator.IsOptional)(), _dec19 = (0, _classValidator.IsUrl)({
  require_tld: false,
  allow_underscores: true
}), _class = class OIDCPluginEnvironment extends _env.Environment {
  constructor() {
    super(...arguments);
    /**
     * OIDC client credentials. To enable authentication with any
     * compatible provider.
     */
    _initializerDefineProperty(this, "OIDC_CLIENT_ID", _descriptor, this);
    _initializerDefineProperty(this, "OIDC_CLIENT_SECRET", _descriptor2, this);
    /**
     * The name of the OIDC provider, eg "GitLab" – this will be displayed on the
     * sign-in button and other places in the UI. The default value is:
     * "OpenID Connect".
     */
    _initializerDefineProperty(this, "OIDC_DISPLAY_NAME", _descriptor3, this);
    /**
     * The OIDC authorization endpoint.
     */
    _initializerDefineProperty(this, "OIDC_AUTH_URI", _descriptor4, this);
    /**
     * The OIDC token endpoint.
     */
    _initializerDefineProperty(this, "OIDC_TOKEN_URI", _descriptor5, this);
    /**
     * The OIDC userinfo endpoint.
     */
    _initializerDefineProperty(this, "OIDC_USERINFO_URI", _descriptor6, this);
    /**
     * The OIDC profile field to use as the username. The default value is
     * "preferred_username".
     */
    _defineProperty(this, "OIDC_USERNAME_CLAIM", _environment.default.OIDC_USERNAME_CLAIM ?? "preferred_username");
    /**
     * A space separated list of OIDC scopes to request. Defaults to "openid
     * profile email".
     */
    _defineProperty(this, "OIDC_SCOPES", _environment.default.OIDC_SCOPES ?? "openid profile email");
    /**
     * Disable autoredirect to the OIDC login page if there is only one
     * authentication method and that method is OIDC.
     */
    _initializerDefineProperty(this, "OIDC_DISABLE_REDIRECT", _descriptor7, this);
    /**
     * The OIDC logout endpoint.
     */
    _initializerDefineProperty(this, "OIDC_LOGOUT_URI", _descriptor8, this);
  }
}, _descriptor = _applyDecoratedDescriptor(_class.prototype, "OIDC_CLIENT_ID", [_dec, _dec2, _dec3, _dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.OIDC_CLIENT_ID);
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "OIDC_CLIENT_SECRET", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.OIDC_CLIENT_SECRET);
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "OIDC_DISPLAY_NAME", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.OIDC_DISPLAY_NAME ?? "OpenID Connect";
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "OIDC_AUTH_URI", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.OIDC_AUTH_URI);
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "OIDC_TOKEN_URI", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.OIDC_TOKEN_URI);
  }
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "OIDC_USERINFO_URI", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.OIDC_USERINFO_URI);
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "OIDC_DISABLE_REDIRECT", [_Public.Public, _dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalBoolean(_environment.default.OIDC_DISABLE_REDIRECT);
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, "OIDC_LOGOUT_URI", [_Public.Public, _dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.OIDC_LOGOUT_URI);
  }
}), _class);
var _default = exports.default = new OIDCPluginEnvironment();