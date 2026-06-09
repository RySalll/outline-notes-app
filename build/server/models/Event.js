"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _queues = require("../queues");
var _types = require("../types");
var _Collection = _interopRequireDefault(require("./Collection"));
var _Document = _interopRequireDefault(require("./Document"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Event = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "events",
  modelName: "event",
  updatedAt: false
}), _dec2 = (0, _sequelizeTypescript.IsUUID)(4), _dec3 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _sequelizeTypescript.Length)({
  max: 255,
  msg: "name must be 255 characters or less"
}), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec7 = Reflect.metadata("design:type", String), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ENUM(...Object.values(_types.AuthenticationType))), _dec10 = Reflect.metadata("design:type", typeof _types.AuthenticationType === "undefined" ? Object : _types.AuthenticationType), _dec11 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec12 = Reflect.metadata("design:type", typeof Record === "undefined" ? Object : Record), _dec13 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec14 = Reflect.metadata("design:type", typeof Record === "undefined" ? Object : Record), _dec15 = Reflect.metadata("design:type", Function), _dec16 = Reflect.metadata("design:paramtypes", [Object]), _dec17 = Reflect.metadata("design:type", Function), _dec18 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec19 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec20 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec21 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec23 = Reflect.metadata("design:type", String), _dec24 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec25 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec26 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec27 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec28 = Reflect.metadata("design:type", String), _dec29 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "actorId"), _dec30 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec31 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec32 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec33 = Reflect.metadata("design:type", String), _dec34 = (0, _sequelizeTypescript.BelongsTo)(() => _Collection.default, "collectionId"), _dec35 = Reflect.metadata("design:type", typeof _Collection.default === "undefined" ? Object : _Collection.default), _dec36 = (0, _sequelizeTypescript.ForeignKey)(() => _Collection.default), _dec37 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec38 = Reflect.metadata("design:type", String), _dec39 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec40 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec41 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec42 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec43 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = class Event extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "modelId", _descriptor, this);
    /** The name of the event. */
    _initializerDefineProperty(this, "name", _descriptor2, this);
    /** The originating IP address of the event. */
    _initializerDefineProperty(this, "ip", _descriptor3, this);
    /** The type of authentication used to create the event. */
    _initializerDefineProperty(this, "authType", _descriptor4, this);
    /**
     * Metadata associated with the event, previously used for storing some changed attributes.
     * Note that the `data` column will be visible to the client and API requests.
     */
    _initializerDefineProperty(this, "data", _descriptor5, this);
    /**
     * The changes made to the model – gradually moving to this column away from `data` which can be
     * used for arbitrary data associated with the event.
     */
    _initializerDefineProperty(this, "changes", _descriptor6, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor7, this);
    _initializerDefineProperty(this, "userId", _descriptor8, this);
    _initializerDefineProperty(this, "document", _descriptor9, this);
    _initializerDefineProperty(this, "documentId", _descriptor10, this);
    _initializerDefineProperty(this, "actor", _descriptor11, this);
    _initializerDefineProperty(this, "actorId", _descriptor12, this);
    _initializerDefineProperty(this, "collection", _descriptor13, this);
    _initializerDefineProperty(this, "collectionId", _descriptor14, this);
    _initializerDefineProperty(this, "team", _descriptor15, this);
    _initializerDefineProperty(this, "teamId", _descriptor16, this);
  }
  // hooks

  static cleanupIp(model) {
    if (model.ip) {
      // cleanup IPV6 representations of IPV4 addresses
      model.ip = model.ip.replace(/^::ffff:/, "");
    }
  }
  static async enqueue(model, options) {
    if (options.transaction) {
      // 'findOrCreate' creates a new transaction always, and the transaction from the middleware is set as its parent.
      // We want to use the parent transaction, otherwise the 'afterCommit' hook will never fire in this case.
      // See: https://github.com/sequelize/sequelize/issues/17452
      (options.transaction.parent || options.transaction).afterCommit(() => void _queues.globalEventQueue.add(model));
      return;
    }
    void _queues.globalEventQueue.add(model);
  }
  /*
   * Schedule can be used to send events into the event system without recording
   * them in the database or audit trail – consider using a task instead.
   */
  static schedule(event) {
    const now = new Date();
    return _queues.globalEventQueue.add(this.build({
      createdAt: now,
      ...event
    }));
  }

  /**
   * Find the latest event matching the where clause
   *
   * @param where The options to match against
   * @returns A promise resolving to the latest event or null
   */
  static findLatest(where) {
    return this.findOne({
      where,
      order: [["createdAt", "DESC"]]
    });
  }

  /**
   * Create and persist new event from request context
   *
   * @param ctx The request context to use
   * @param attributes The event attributes
   * @returns A promise resolving to the new event
   */
  static createFromContext(ctx) {
    let attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let defaultAttributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let options = arguments.length > 3 ? arguments[3] : undefined;
    const user = ctx.state.auth?.user;
    const authType = ctx.state.auth?.type;
    return this.create({
      ...attributes,
      actorId: user?.id || defaultAttributes.actorId,
      teamId: user?.teamId || defaultAttributes.teamId,
      ip: ctx.request.ip || defaultAttributes.ip,
      authType
    }, {
      transaction: ctx.state.transaction,
      ...options
    });
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "modelId", [_dec2, _dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec5, _dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "ip", [_sequelizeTypescript.IsIP, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "authType", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "data", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "changes", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "cleanupIp", [_sequelizeTypescript.BeforeCreate, _dec15, _dec16], Object.getOwnPropertyDescriptor(_class2, "cleanupIp"), _class2), _applyDecoratedDescriptor(_class2, "enqueue", [_sequelizeTypescript.AfterSave, _dec17, _dec18], Object.getOwnPropertyDescriptor(_class2, "enqueue"), _class2), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec21, _dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_dec26, _dec27, _dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "actor", [_dec29, _dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "actorId", [_dec31, _dec32, _dec33], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec34, _dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "collectionId", [_dec36, _dec37, _dec38], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec39, _dec40], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec41, _dec42, _dec43], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = Event;