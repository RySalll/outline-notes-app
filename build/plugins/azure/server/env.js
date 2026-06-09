"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _env = require("./../../../server/env");
var _environment = _interopRequireDefault(require("./../../../server/utils/environment"));
var _validators = require("./../../../server/utils/validators");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let AzurePluginEnvironment = (_dec = (0, _classValidator.IsOptional)(), _dec2 = (0, _validators.CannotUseWithout)("AZURE_CLIENT_SECRET"), _dec3 = (0, _classValidator.IsOptional)(), _dec4 = (0, _validators.CannotUseWithout)("AZURE_CLIENT_ID"), _dec5 = (0, _classValidator.IsOptional)(), _dec6 = (0, _classValidator.IsOptional)(), _dec7 = (0, _validators.CannotUseWithout)("AZURE_CLIENT_ID"), _class = class AzurePluginEnvironment extends _env.Environment {
  constructor() {
    super(...arguments);
    /**
     * Azure OAuth2 client credentials. To enable authentication with Azure.
     */
    _initializerDefineProperty(this, "AZURE_CLIENT_ID", _descriptor, this);
    _initializerDefineProperty(this, "AZURE_CLIENT_SECRET", _descriptor2, this);
    _initializerDefineProperty(this, "AZURE_RESOURCE_APP_ID", _descriptor3, this);
    _initializerDefineProperty(this, "AZURE_TENANT_ID", _descriptor4, this);
  }
}, _descriptor = _applyDecoratedDescriptor(_class.prototype, "AZURE_CLIENT_ID", [_dec, _dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AZURE_CLIENT_ID);
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "AZURE_CLIENT_SECRET", [_dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AZURE_CLIENT_SECRET);
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "AZURE_RESOURCE_APP_ID", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AZURE_RESOURCE_APP_ID) ?? "00000003-0000-0000-c000-000000000000";
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "AZURE_TENANT_ID", [_dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AZURE_TENANT_ID);
  }
}), _class);
var _default = exports.default = new AzurePluginEnvironment();