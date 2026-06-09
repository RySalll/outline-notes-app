"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _Model = _interopRequireDefault(require("./base/Model"));
var _errors = require("../errors");
var _Team = _interopRequireDefault(require("./Team"));
var _UserAuthentication = _interopRequireDefault(require("./UserAuthentication"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _azure = _interopRequireDefault(require("./../../plugins/azure/server/azure"));
var _google = _interopRequireDefault(require("./../../plugins/google/server/google"));
var _oidc = _interopRequireDefault(require("./../../plugins/oidc/server/oidc"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8; // TODO: Avoid this hardcoding of plugins
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let AuthenticationProvider = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withUserAuthentication: userId => ({
    include: [{
      model: _UserAuthentication.default,
      as: "userAuthentications",
      required: true,
      where: {
        userId
      }
    }]
  })
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "authentication_providers",
  modelName: "authentication_provider",
  updatedAt: false
}), _dec3 = (0, _sequelizeTypescript.IsUUID)(4), _dec4 = (0, _sequelizeTypescript.Default)(_sequelizeTypescript.DataType.UUIDV4), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec6 = Reflect.metadata("design:type", String), _dec7 = (0, _Length.default)({
  max: 255,
  msg: "name must be 255 characters or less"
}), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _sequelizeTypescript.Default)(true), _dec10 = Reflect.metadata("design:type", Boolean), _dec11 = (0, _Length.default)({
  max: 255,
  msg: "providerId must be 255 characters or less"
}), _dec12 = Reflect.metadata("design:type", String), _dec13 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec14 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec15 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec16 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec18 = Reflect.metadata("design:type", String), _dec19 = (0, _sequelizeTypescript.HasMany)(() => _UserAuthentication.default, "authenticationProviderId"), _dec20 = Reflect.metadata("design:type", Array), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class AuthenticationProvider extends _Model.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "id", _descriptor, this);
    _initializerDefineProperty(this, "name", _descriptor2, this);
    _initializerDefineProperty(this, "enabled", _descriptor3, this);
    _initializerDefineProperty(this, "providerId", _descriptor4, this);
    _initializerDefineProperty(this, "createdAt", _descriptor5, this);
    // associations
    _initializerDefineProperty(this, "team", _descriptor6, this);
    _initializerDefineProperty(this, "teamId", _descriptor7, this);
    _initializerDefineProperty(this, "userAuthentications", _descriptor8, this);
    _defineProperty(this, "disable", async options => {
      const res = await this.constructor.findAndCountAll({
        ...options,
        where: {
          teamId: this.teamId,
          enabled: true,
          id: {
            [_sequelize.Op.ne]: this.id
          }
        },
        limit: 1
      });
      if (res.count >= 1) {
        return this.update({
          enabled: false
        }, options);
      } else {
        throw (0, _errors.ValidationError)("At least one authentication provider is required");
      }
    });
    _defineProperty(this, "enable", options => this.update({
      enabled: true
    }, options));
  }
  // instance methods

  /**
   * Create an OAuthClient for this provider, if possible.
   *
   * @returns A configured OAuthClient instance
   */
  get oauthClient() {
    switch (this.name) {
      case "google":
        return new _google.default();
      case "azure":
        return new _azure.default();
      case "oidc":
        return new _oidc.default();
      default:
        return undefined;
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec3, _sequelizeTypescript.PrimaryKey, _dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec7, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "enabled", [_dec9, _sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "providerId", [_dec11, _sequelizeTypescript.Column, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "createdAt", [_sequelizeTypescript.CreatedAt, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec16, _dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "userAuthentications", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class);
var _default = exports.default = AuthenticationProvider;