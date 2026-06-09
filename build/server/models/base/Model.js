"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fastDeepEqual = _interopRequireDefault(require("fast-deep-equal"));
var _isArray = _interopRequireDefault(require("lodash/isArray"));
var _isObject = _interopRequireDefault(require("lodash/isObject"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _Changeset = require("../decorators/Changeset");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class, _Model;
/* eslint-disable @typescript-eslint/ban-types */
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
let Model = (_dec = Reflect.metadata("design:type", Function), _dec2 = Reflect.metadata("design:paramtypes", [typeof T === "undefined" ? Object : T]), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof T === "undefined" ? Object : T, typeof HookContext === "undefined" ? Object : HookContext]), _dec5 = Reflect.metadata("design:type", Function), _dec6 = Reflect.metadata("design:paramtypes", [typeof T === "undefined" ? Object : T, typeof HookContext === "undefined" ? Object : HookContext]), _dec7 = Reflect.metadata("design:type", Function), _dec8 = Reflect.metadata("design:paramtypes", [typeof T === "undefined" ? Object : T, typeof HookContext === "undefined" ? Object : HookContext]), _dec9 = Reflect.metadata("design:type", Function), _dec10 = Reflect.metadata("design:paramtypes", [typeof T === "undefined" ? Object : T, typeof HookContext === "undefined" ? Object : HookContext]), _dec11 = Reflect.metadata("design:type", Function), _dec12 = Reflect.metadata("design:paramtypes", [typeof T === "undefined" ? Object : T, typeof HookContext === "undefined" ? Object : HookContext]), _class = (_Model = class Model extends _sequelizeTypescript.Model {
  constructor() {
    super(...arguments);
    _defineProperty(this, "previousChangeset", void 0);
  }
  /**
   * Validates this instance, and if the validation passes, persists it to the database.
   */
  saveWithCtx(ctx, options, eventOpts) {
    const hookContext = {
      ...ctx.context,
      event: {
        ...eventOpts,
        create: true
      }
    };
    return this.save({
      ...options,
      ...hookContext
    });
  }

  /**
   * This is the same as calling `set` and then calling `save`.
   */
  updateWithCtx(ctx, keys, eventOpts) {
    const hookContext = {
      ...ctx.context,
      event: {
        ...eventOpts,
        create: true
      }
    };
    this.set(keys);
    return this.save(hookContext);
  }

  /**
   * Destroy the row corresponding to this instance. Depending on your setting for paranoid, the row will
   * either be completely deleted, or have its deletedAt timestamp set to the current time.
   */
  destroyWithCtx(ctx, eventOpts) {
    const hookContext = {
      ...ctx.context,
      event: {
        ...eventOpts,
        create: true
      }
    };
    return this.destroy(hookContext);
  }

  /**
   * Restore the row corresponding to this instance. Only available for paranoid models.
   */
  restoreWithCtx(ctx, eventOpts) {
    const hookContext = {
      ...ctx.context,
      event: {
        ...eventOpts,
        create: true
      }
    };
    return this.restore(hookContext);
  }

  /**
   * Find a row that matches the query, or build and save the row if none is found
   * The successful result of the promise will be (instance, created) - Make sure to use `.then(([...]))`
   */
  static findOrCreateWithCtx(ctx, options, eventOpts) {
    const hookContext = {
      ...ctx.context,
      event: {
        ...eventOpts,
        create: true
      }
    };
    return this.findOrCreate({
      ...options,
      ...hookContext
    });
  }

  /**
   * Builds a new model instance and calls save on it.
   */
  static createWithCtx(ctx, values, eventOpts) {
    const hookContext = {
      ...ctx.context,
      event: {
        ...eventOpts,
        create: true
      }
    };
    return this.create(values, hookContext);
  }
  static async beforeSaveEvent(model) {
    model.cacheChangeset();
  }
  static async afterCreateEvent(model, context) {
    await this.insertEvent("create", model, context);
  }
  static async afterUpsertEvent(model, context) {
    await this.insertEvent("create", model, context);
  }
  static async afterUpdateEvent(model, context) {
    await this.insertEvent("update", model, context);
  }
  static async afterDestroyEvent(model, context) {
    await this.insertEvent("delete", model, context);
  }
  static async afterRestoreEvent(model, context) {
    await this.insertEvent("create", model, context);
  }

  /**
   * Insert an event into the database recording a mutation to this model.
   *
   * @param name The name of the event.
   * @param model The model that was mutated.
   * @param context The API context.
   */
  static async insertEvent(name, model, context) {
    const namespace = this.eventNamespace ?? this.tableName;
    const models = this.sequelize.models;
    if (!context.event?.create) {
      return;
    }
    if (!context.transaction) {
      _Logger.default.warn("No transaction provided to insertEvent", {
        modelId: model.id
      });
    }
    if (!context.ip) {
      _Logger.default.warn("No ip provided to insertEvent", {
        modelId: model.id
      });
    }
    return models.event.create({
      name: `${namespace}.${context.event.name ?? name}`,
      modelId: "modelId" in model ? model.modelId : model.id,
      collectionId: "collectionId" in model ? model.collectionId : model instanceof models.collection ? model.id : undefined,
      documentId: "documentId" in model ? model.documentId : model instanceof models.document ? model.id : undefined,
      userId: "userId" in model ? model.userId : model instanceof models.user ? model.id : undefined,
      teamId: "teamId" in model ? model.teamId : model instanceof models.team ? model.id : context.auth?.user.teamId,
      actorId: context.auth?.user?.id,
      authType: context.auth?.type,
      ip: context.ip,
      changes: model.previousChangeset,
      data: context.event.data
    }, {
      transaction: context.transaction
    });
  }

  /**
   * Find all models in batches, calling the callback function for each batch.
   *
   * @param query The query options.
   * @param callback The function to call for each batch of results
   */
  static async findAllInBatches(query, callback) {
    const mappedQuery = {
      ...query,
      offset: query.offset ?? 0,
      limit: query.batchLimit ?? 10
    };
    let results;
    do {
      // @ts-expect-error this T
      results = await this.findAll(mappedQuery);
      await callback(results, mappedQuery);
      mappedQuery.offset += mappedQuery.limit;
    } while (results.length >= mappedQuery.limit);
  }

  /**
   * Returns a representation of the attributes that have changed since the last save and their previous values.
   *
   * @returns An object with `attributes` and `previousAttributes` keys.
   */
  get changeset() {
    const changes = this.changed();
    const attributes = {};
    const previousAttributes = {};
    if (!changes) {
      return {
        attributes,
        previous: previousAttributes
      };
    }
    const virtualFields = this.constructor.virtualFields;
    const blobFields = this.constructor.blobFields;
    const skippedFields = (0, _Changeset.getChangsetSkipped)(this);
    for (const change of changes) {
      const previous = this.previous(change);
      const current = this.getDataValue(change);
      if (virtualFields.includes(String(change)) || blobFields.includes(String(change)) || skippedFields.includes(String(change))) {
        continue;
      }
      if ((0, _isObject.default)(previous) && (0, _isObject.default)(current) && !(0, _isArray.default)(previous) && !(0, _isArray.default)(current)) {
        const difference = Object.keys(previous).concat(Object.keys(current))
        // @ts-expect-error TODO
        .filter(key => !(0, _fastDeepEqual.default)(previous[key], current[key]));
        previousAttributes[change] = (0, _pick.default)(previous, difference);
        attributes[change] = (0, _pick.default)(current, difference);
      } else {
        previousAttributes[change] = previous;
        attributes[change] = current;
      }
    }
    return {
      attributes,
      previous: previousAttributes
    };
  }

  /**
   * Cache the current changeset for later use.
   */
  cacheChangeset() {
    const previous = this.changeset;
    if (Object.keys(previous.attributes).length > 0 || Object.keys(previous.previous).length > 0) {
      this.previousChangeset = previous;
    }
  }

  /**
   * Returns the virtual fields for this model.
   */
  static get virtualFields() {
    const attrs = this.rawAttributes;
    return Object.keys(attrs).filter(attr => attrs[attr].type instanceof _sequelize.DataTypes.VIRTUAL);
  }

  /**
   * Returns the blob fields for this model.
   */
  static get blobFields() {
    const attrs = this.rawAttributes;
    return Object.keys(attrs).filter(attr => attrs[attr].type instanceof _sequelize.DataTypes.BLOB);
  }
}, _defineProperty(_Model, "eventNamespace", void 0), _Model), _applyDecoratedDescriptor(_class, "beforeSaveEvent", [_sequelizeTypescript.BeforeSave, _dec, _dec2], Object.getOwnPropertyDescriptor(_class, "beforeSaveEvent"), _class), _applyDecoratedDescriptor(_class, "afterCreateEvent", [_sequelizeTypescript.AfterCreate, _dec3, _dec4], Object.getOwnPropertyDescriptor(_class, "afterCreateEvent"), _class), _applyDecoratedDescriptor(_class, "afterUpsertEvent", [_sequelizeTypescript.AfterUpsert, _dec5, _dec6], Object.getOwnPropertyDescriptor(_class, "afterUpsertEvent"), _class), _applyDecoratedDescriptor(_class, "afterUpdateEvent", [_sequelizeTypescript.AfterUpdate, _dec7, _dec8], Object.getOwnPropertyDescriptor(_class, "afterUpdateEvent"), _class), _applyDecoratedDescriptor(_class, "afterDestroyEvent", [_sequelizeTypescript.AfterDestroy, _dec9, _dec10], Object.getOwnPropertyDescriptor(_class, "afterDestroyEvent"), _class), _applyDecoratedDescriptor(_class, "afterRestoreEvent", [_sequelizeTypescript.AfterRestore, _dec11, _dec12], Object.getOwnPropertyDescriptor(_class, "afterRestoreEvent"), _class), _class);
var _default = exports.default = Model;