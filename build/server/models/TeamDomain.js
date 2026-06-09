"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _emailProviders = _interopRequireDefault(require("email-providers"));
var _sequelizeTypescript = require("sequelize-typescript");
var _validations = require("./../../shared/validations");
var _env = _interopRequireDefault(require("./../env"));
var _errors = require("./../errors");
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _IsFQDN = _interopRequireDefault(require("./validators/IsFQDN"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let TeamDomain = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "team_domains",
  modelName: "team_domain"
}), _dec2 = (0, _sequelizeTypescript.NotIn)({
  args: _env.default.isCloudHosted ? [_emailProviders.default] : [],
  msg: "You chose a restricted domain, please try another."
}), _dec3 = (0, _Length.default)({
  max: 255,
  msg: "name must be 255 characters or less"
}), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec6 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec7 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec10 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec11 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec12 = Reflect.metadata("design:type", String), _dec13 = Reflect.metadata("design:type", Function), _dec14 = Reflect.metadata("design:paramtypes", [Object]), _dec15 = Reflect.metadata("design:type", Function), _dec16 = Reflect.metadata("design:paramtypes", [Object]), _dec(_class = (0, _Fix.default)(_class = (_class2 = class TeamDomain extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "name", _descriptor, this);
    // associations
    _initializerDefineProperty(this, "team", _descriptor2, this);
    _initializerDefineProperty(this, "teamId", _descriptor3, this);
    _initializerDefineProperty(this, "createdBy", _descriptor4, this);
    _initializerDefineProperty(this, "createdById", _descriptor5, this);
  }
  // hooks

  static async cleanupDomain(model) {
    model.name = model.name.toLowerCase().trim();
  }
  static async checkLimit(model) {
    if (!_env.default.isCloudHosted) {
      return;
    }
    const count = await this.count({
      where: {
        teamId: model.teamId
      }
    });
    if (count >= _validations.TeamValidation.maxDomains) {
      throw (0, _errors.ValidationError)(`You have reached the limit of ${_validations.TeamValidation.maxDomains} domains`);
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec2, _sequelizeTypescript.NotEmpty, _dec3, _IsFQDN.default, _sequelizeTypescript.Column, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec7, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec11, _sequelizeTypescript.Column, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "cleanupDomain", [_sequelizeTypescript.BeforeValidate, _dec13, _dec14], Object.getOwnPropertyDescriptor(_class2, "cleanupDomain"), _class2), _applyDecoratedDescriptor(_class2, "checkLimit", [_sequelizeTypescript.BeforeCreate, _dec15, _dec16], Object.getOwnPropertyDescriptor(_class2, "checkLimit"), _class2), _class2)) || _class) || _class);
var _default = exports.default = TeamDomain;