"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _GroupMembership = _interopRequireDefault(require("./GroupMembership"));
var _GroupUser = _interopRequireDefault(require("./GroupUser"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _CounterCache = require("./decorators/CounterCache");
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _NotContainsUrl = _interopRequireDefault(require("./validators/NotContainsUrl"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Group = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withMembership: userId => ({
    include: [{
      association: "groupUsers",
      required: true,
      where: {
        userId
      }
    }]
  })
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "groups",
  modelName: "group",
  validate: {
    async isUniqueNameInTeam() {
      const foundItem = await Group.findOne({
        where: {
          teamId: this.teamId,
          name: {
            [_sequelize.Op.iLike]: this.name
          },
          id: {
            [_sequelize.Op.not]: this.id
          }
        }
      });
      if (foundItem) {
        throw new Error("The name of this group is already in use");
      }
    }
  }
}), _dec3 = (0, _Length.default)({
  min: 0,
  max: 255,
  msg: "name must be be 255 characters or less"
}), _dec4 = Reflect.metadata("design:type", String), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _sequelizeTypescript.HasMany)(() => _GroupUser.default, "groupId"), _dec7 = Reflect.metadata("design:type", Array), _dec8 = (0, _sequelizeTypescript.HasMany)(() => _GroupMembership.default, "groupId"), _dec9 = Reflect.metadata("design:type", Array), _dec10 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec11 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec12 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec13 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec14 = Reflect.metadata("design:type", String), _dec15 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec16 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec17 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec18 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec19 = Reflect.metadata("design:type", String), _dec20 = (0, _sequelizeTypescript.BelongsToMany)(() => _User.default, () => _GroupUser.default), _dec21 = Reflect.metadata("design:type", Array), _dec22 = (0, _CounterCache.CounterCache)(() => _GroupUser.default, {
  as: "members",
  foreignKey: "groupId"
}), _dec23 = Reflect.metadata("design:type", typeof Promise === "undefined" ? Object : Promise), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class Group extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "name", _descriptor, this);
    _initializerDefineProperty(this, "externalId", _descriptor2, this);
    // associations
    _initializerDefineProperty(this, "groupUsers", _descriptor3, this);
    _initializerDefineProperty(this, "groupMemberships", _descriptor4, this);
    _initializerDefineProperty(this, "team", _descriptor5, this);
    _initializerDefineProperty(this, "teamId", _descriptor6, this);
    _initializerDefineProperty(this, "createdBy", _descriptor7, this);
    _initializerDefineProperty(this, "createdById", _descriptor8, this);
    _initializerDefineProperty(this, "users", _descriptor9, this);
    _initializerDefineProperty(this, "memberCount", _descriptor10, this);
  }
  static filterByMember(userId) {
    return userId ? this.scope({
      method: ["withMembership", userId]
    }) : this.scope("defaultScope");
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec3, _NotContainsUrl.default, _sequelizeTypescript.Column, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "externalId", [_sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "groupUsers", [_dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "groupMemberships", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec12, _dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec17, _dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "users", [_dec20, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "memberCount", [_dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class);
var _default = exports.default = Group;