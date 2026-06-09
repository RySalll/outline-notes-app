"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _types = require("./../../shared/types");
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Encrypted = _interopRequireDefault(require("./decorators/Encrypted"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let IntegrationAuthentication = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "authentications",
  modelName: "authentication"
}), _dec2 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec3 = Reflect.metadata("design:type", typeof _types.IntegrationService === "undefined" ? Object : _types.IntegrationService), _dec4 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec5 = Reflect.metadata("design:type", Array), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec7 = Reflect.metadata("design:type", String), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec9 = Reflect.metadata("design:type", String), _dec10 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec11 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec12 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec13 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec14 = Reflect.metadata("design:type", String), _dec15 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec16 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec17 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec18 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec19 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = class IntegrationAuthentication extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "service", _descriptor, this);
    _initializerDefineProperty(this, "scopes", _descriptor2, this);
    _initializerDefineProperty(this, "token", _descriptor3, this);
    _initializerDefineProperty(this, "refreshToken", _descriptor4, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor5, this);
    _initializerDefineProperty(this, "userId", _descriptor6, this);
    _initializerDefineProperty(this, "team", _descriptor7, this);
    _initializerDefineProperty(this, "teamId", _descriptor8, this);
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "service", [_dec2, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "scopes", [_dec4, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "token", [_dec6, _Encrypted.default, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "refreshToken", [_dec8, _Encrypted.default, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec12, _dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec17, _dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = IntegrationAuthentication;