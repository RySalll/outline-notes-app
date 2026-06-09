"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _Document = _interopRequireDefault(require("./Document"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let View = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withUser: () => ({
    include: [{
      model: _User.default,
      required: true,
      as: "user"
    }]
  })
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "views",
  modelName: "view"
}), _dec3 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec4 = (0, _sequelizeTypescript.Default)(1), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec6 = Reflect.metadata("design:type", Number), _dec7 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec8 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec9 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec10 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec11 = Reflect.metadata("design:type", String), _dec12 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec13 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec14 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec16 = Reflect.metadata("design:type", String), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class View extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "lastEditingAt", _descriptor, this);
    _initializerDefineProperty(this, "count", _descriptor2, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor3, this);
    _initializerDefineProperty(this, "userId", _descriptor4, this);
    _initializerDefineProperty(this, "document", _descriptor5, this);
    _initializerDefineProperty(this, "documentId", _descriptor6, this);
  }
  static async incrementOrCreate(where, options) {
    const [model, created] = await this.findOrCreate({
      ...options,
      where
    });
    if (!created) {
      model.count += 1;
      await model.save(options);
    }
    return model;
  }
  static async findByDocument(documentId, _ref) {
    let {
      includeSuspended
    } = _ref;
    return this.findAll({
      where: {
        documentId
      },
      order: [["updatedAt", "DESC"]],
      include: [{
        model: _User.default,
        required: true,
        ...(includeSuspended ? {} : {
          where: {
            suspendedAt: {
              [_sequelize.Op.is]: null
            }
          }
        })
      }]
    });
  }
  static async touch(documentId, userId, isEditing) {
    const values = {
      updatedAt: new Date()
    };
    if (isEditing) {
      values.lastEditingAt = new Date();
    }
    await this.update(values, {
      where: {
        userId,
        documentId
      },
      returning: false
    });
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "lastEditingAt", [_sequelizeTypescript.Column, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "count", [_dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec9, _dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_dec14, _dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class);
var _default = exports.default = View;