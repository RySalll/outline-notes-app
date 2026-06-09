"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _types = require("./../../shared/types");
var _files = _interopRequireDefault(require("./../storage/files"));
var _Collection = _interopRequireDefault(require("./Collection"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _FileOperation;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let FileOperation = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    model: _User.default,
    as: "user",
    paranoid: false
  }, {
    model: _Collection.default,
    as: "collection",
    paranoid: false
  }]
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "file_operations",
  modelName: "file_operation"
}), _dec3 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ENUM(...Object.values(_types.FileOperationType))), _dec4 = Reflect.metadata("design:type", typeof _types.FileOperationType === "undefined" ? Object : _types.FileOperationType), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec6 = Reflect.metadata("design:type", typeof _types.FileOperationFormat === "undefined" ? Object : _types.FileOperationFormat), _dec7 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ENUM(...Object.values(_types.FileOperationState))), _dec8 = Reflect.metadata("design:type", typeof _types.FileOperationState === "undefined" ? Object : _types.FileOperationState), _dec9 = Reflect.metadata("design:type", String), _dec10 = Reflect.metadata("design:type", String), _dec11 = Reflect.metadata("design:type", String), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BIGINT), _dec13 = Reflect.metadata("design:type", Number), _dec14 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSON), _dec15 = Reflect.metadata("design:type", typeof FileOperationOptions === "undefined" ? Object : FileOperationOptions), _dec16 = Reflect.metadata("design:type", Function), _dec17 = Reflect.metadata("design:paramtypes", [Object]), _dec18 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec19 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec20 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec21 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec22 = Reflect.metadata("design:type", String), _dec23 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec24 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec25 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec26 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec27 = Reflect.metadata("design:type", String), _dec28 = (0, _sequelizeTypescript.BelongsTo)(() => _Collection.default, "collectionId"), _dec29 = Reflect.metadata("design:type", typeof _Collection.default === "undefined" ? Object : _Collection.default), _dec30 = (0, _sequelizeTypescript.ForeignKey)(() => _Collection.default), _dec31 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec32 = Reflect.metadata("design:type", String), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = (_FileOperation = class FileOperation extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "type", _descriptor, this);
    _initializerDefineProperty(this, "format", _descriptor2, this);
    _initializerDefineProperty(this, "state", _descriptor3, this);
    _initializerDefineProperty(this, "key", _descriptor4, this);
    _initializerDefineProperty(this, "url", _descriptor5, this);
    _initializerDefineProperty(this, "error", _descriptor6, this);
    _initializerDefineProperty(this, "size", _descriptor7, this);
    /**
     * Additional configuration options for the file operation.
     */
    _initializerDefineProperty(this, "options", _descriptor8, this);
    /**
     * Mark the current file operation as expired and remove the file from storage.
     */
    _defineProperty(this, "expire", async function () {
      this.state = _types.FileOperationState.Expired;
      try {
        await _files.default.deleteFile(this.key);
      } catch (err) {
        if (err.retryable) {
          throw err;
        }
      }
      return this.save();
    });
    // associations
    _initializerDefineProperty(this, "user", _descriptor9, this);
    _initializerDefineProperty(this, "userId", _descriptor10, this);
    _initializerDefineProperty(this, "team", _descriptor11, this);
    _initializerDefineProperty(this, "teamId", _descriptor12, this);
    _initializerDefineProperty(this, "collection", _descriptor13, this);
    _initializerDefineProperty(this, "collectionId", _descriptor14, this);
  }
  /**
   * The file operation contents as a readable stream.
   */
  get stream() {
    return _files.default.getFileStream(this.key);
  }

  /**
   * The file operation contents as a handle which contains a path and cleanup function.
   */
  get handle() {
    return _files.default.getFileHandle(this.key);
  }

  // hooks

  static async deleteFileFromS3(model) {
    await _files.default.deleteFile(model.key);
  }
  /**
   * Count the number of export file operations for a given team after a point
   * in time.
   *
   * @param teamId The team id
   * @param startDate The start time
   * @returns The number of file operations
   */
  static async countExportsAfterDateTime(teamId, startDate) {
    let where = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return this.count({
      where: {
        teamId,
        createdAt: {
          [_sequelize.Op.gt]: startDate
        },
        ...where
      }
    });
  }
}, _defineProperty(_FileOperation, "eventNamespace", "fileOperations"), _FileOperation), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "format", [_dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "state", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "key", [_sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "url", [_sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "error", [_sequelizeTypescript.Column, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "size", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "options", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "deleteFileFromS3", [_sequelizeTypescript.BeforeDestroy, _dec16, _dec17], Object.getOwnPropertyDescriptor(_class2, "deleteFileFromS3"), _class2), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec20, _dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec23, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec25, _dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec28, _dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "collectionId", [_dec30, _dec31, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class);
var _default = exports.default = FileOperation;