"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _types = require("./../../shared/types");
var _Collection = _interopRequireDefault(require("./Collection"));
var _Document = _interopRequireDefault(require("./Document"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
/**
 * Represents a users's permission to access a collection or document.
 */
let UserMembership = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withUser: {
    include: [{
      association: "user"
    }]
  },
  withCollection: {
    where: {
      collectionId: {
        [_sequelize.Op.ne]: null
      }
    },
    include: [{
      association: "collection"
    }]
  },
  withDocument: {
    where: {
      documentId: {
        [_sequelize.Op.ne]: null
      }
    },
    include: [{
      association: "document"
    }]
  }
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "user_permissions",
  modelName: "user_permission"
}), _dec3 = (0, _sequelizeTypescript.Default)(_types.CollectionPermission.ReadWrite), _dec4 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.CollectionPermission)]), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec6 = Reflect.metadata("design:type", Object), _dec7 = (0, _sequelizeTypescript.Length)({
  max: 256,
  msg: `index must be 256 characters or less`
}), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _sequelizeTypescript.BelongsTo)(() => _Collection.default, "collectionId"), _dec10 = Reflect.metadata("design:type", typeof _Collection.default === "undefined" ? Object : _Collection.default), _dec11 = (0, _sequelizeTypescript.ForeignKey)(() => _Collection.default), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec13 = Reflect.metadata("design:type", String), _dec14 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec15 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec16 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec18 = Reflect.metadata("design:type", String), _dec19 = (0, _sequelizeTypescript.BelongsTo)(() => UserMembership, "sourceId"), _dec20 = Reflect.metadata("design:type", Object), _dec21 = (0, _sequelizeTypescript.ForeignKey)(() => UserMembership), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec23 = Reflect.metadata("design:type", String), _dec24 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec25 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec26 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec27 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec28 = Reflect.metadata("design:type", String), _dec29 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec30 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec31 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec32 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec33 = Reflect.metadata("design:type", String), _dec34 = Reflect.metadata("design:type", Function), _dec35 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec36 = Reflect.metadata("design:type", Function), _dec37 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec38 = Reflect.metadata("design:type", Function), _dec39 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec40 = Reflect.metadata("design:type", Function), _dec41 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec42 = Reflect.metadata("design:type", Function), _dec43 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class UserMembership extends _IdModel.default {
  constructor() {
    super(...arguments);
    /** The permission granted to the user. */
    _initializerDefineProperty(this, "permission", _descriptor, this);
    /** The visible sort order in "shared with me" */
    _initializerDefineProperty(this, "index", _descriptor2, this);
    // associations
    /** The collection that this membership grants the user access to. */
    _initializerDefineProperty(this, "collection", _descriptor3, this);
    /** The collection ID that this membership grants the user access to. */
    _initializerDefineProperty(this, "collectionId", _descriptor4, this);
    /** The document that this membership grants the user access to. */
    _initializerDefineProperty(this, "document", _descriptor5, this);
    /** The document ID that this membership grants the user access to. */
    _initializerDefineProperty(this, "documentId", _descriptor6, this);
    /** If this represents the membership on a child then this points to the membership on the root */
    _initializerDefineProperty(this, "source", _descriptor7, this);
    /** If this represents the membership on a child then this points to the membership on the root */
    _initializerDefineProperty(this, "sourceId", _descriptor8, this);
    /** The user that this membership is granted to. */
    _initializerDefineProperty(this, "user", _descriptor9, this);
    /** The user ID that this membership is granted to. */
    _initializerDefineProperty(this, "userId", _descriptor10, this);
    /** The user that created this membership. */
    _initializerDefineProperty(this, "createdBy", _descriptor11, this);
    /** The user ID that created this membership. */
    _initializerDefineProperty(this, "createdById", _descriptor12, this);
  }
  // static methods

  /**
   * Copy user memberships from one document to another.
   *
   * @param where The where clause to find the user memberships to copy.
   * @param document The document to copy the user memberships to.
   * @param options Additional options to pass to the query.
   */
  static async copy(where, document, options) {
    const {
      transaction
    } = options;
    const userMemberships = await this.findAll({
      where,
      transaction
    });
    await Promise.all(userMemberships.map(membership => this.create({
      documentId: document.id,
      userId: membership.userId,
      sourceId: membership.sourceId ?? membership.id,
      permission: membership.permission,
      createdById: membership.createdById
    }, {
      transaction,
      hooks: false
    })));
  }

  /**
   * Find the root membership for a document and (optionally) user.
   *
   * @param documentId The document ID to find the membership for.
   * @param userId The user ID to find the membership for.
   * @param options Additional options to pass to the query.
   * @returns A promise that resolves to the root memberships for the document and user, or null.
   */
  static async findRootMembershipsForDocument(documentId, userId, options) {
    const memberships = await this.findAll({
      where: {
        documentId,
        ...(userId ? {
          userId
        } : {})
      }
    });
    const rootMemberships = await Promise.all(memberships.map(membership => membership?.sourceId ? this.findByPk(membership.sourceId, options) : membership));
    return rootMemberships.filter(Boolean);
  }

  // hooks

  static async createSourcedMemberships(model, options) {
    if (model.sourceId || !model.documentId) {
      return;
    }
    return this.recreateSourcedMemberships(model, options);
  }
  static async publishAddUserEventAfterCreate(model, context) {
    await model.insertEvent(context, "add_user", {
      isNew: true
    });
  }
  static async updateSourcedMemberships(model, options) {
    if (model.sourceId || !model.documentId) {
      return;
    }
    const {
      transaction
    } = options;
    if (model.changed("permission")) {
      await this.update({
        permission: model.permission
      }, {
        where: {
          userId: model.userId,
          sourceId: model.id
        },
        transaction
      });
    }
  }
  static async publishAddUserEventAfterUpdate(model, context) {
    await model.insertEvent(context, "add_user", {
      isNew: false
    });
  }
  static async publishRemoveUserEvent(model, context) {
    await model.insertEvent(context, "remove_user");
  }

  /**
   * Recreate all sourced permissions for a given permission.
   */
  static async recreateSourcedMemberships(model, options) {
    if (!model.documentId) {
      return;
    }
    const {
      transaction
    } = options;
    await this.destroy({
      where: {
        userId: model.userId,
        sourceId: model.id
      },
      transaction
    });
    const document = await _Document.default.unscoped().scope("withoutState").findOne({
      attributes: ["id"],
      where: {
        id: model.documentId
      },
      transaction
    });
    if (!document) {
      return;
    }
    const childDocumentIds = await document.findAllChildDocumentIds({
      publishedAt: {
        [_sequelize.Op.ne]: null
      }
    }, {
      transaction
    });
    for (const childDocumentId of childDocumentIds) {
      await this.create({
        documentId: childDocumentId,
        userId: model.userId,
        permission: model.permission,
        sourceId: model.id,
        createdById: model.createdById,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt
      }, {
        transaction,
        hooks: false
      });
    }
  }
  async insertEvent(ctx, name, data) {
    const hookContext = {
      ...ctx,
      event: {
        name,
        data,
        create: true
      }
    };
    if (this.collectionId) {
      await _Collection.default.insertEvent(name, this, hookContext);
    } else {
      await _Document.default.insertEvent(name, this, hookContext);
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "permission", [_dec3, _dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "index", [_dec7, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "collectionId", [_dec11, _dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_dec16, _dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "source", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "sourceId", [_dec21, _dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec26, _dec27, _dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec29, _dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec31, _dec32, _dec33], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "createSourcedMemberships", [_sequelizeTypescript.AfterCreate, _dec34, _dec35], Object.getOwnPropertyDescriptor(_class2, "createSourcedMemberships"), _class2), _applyDecoratedDescriptor(_class2, "publishAddUserEventAfterCreate", [_sequelizeTypescript.AfterCreate, _dec36, _dec37], Object.getOwnPropertyDescriptor(_class2, "publishAddUserEventAfterCreate"), _class2), _applyDecoratedDescriptor(_class2, "updateSourcedMemberships", [_sequelizeTypescript.AfterUpdate, _dec38, _dec39], Object.getOwnPropertyDescriptor(_class2, "updateSourcedMemberships"), _class2), _applyDecoratedDescriptor(_class2, "publishAddUserEventAfterUpdate", [_sequelizeTypescript.AfterUpdate, _dec40, _dec41], Object.getOwnPropertyDescriptor(_class2, "publishAddUserEventAfterUpdate"), _class2), _applyDecoratedDescriptor(_class2, "publishRemoveUserEvent", [_sequelizeTypescript.AfterDestroy, _dec42, _dec43], Object.getOwnPropertyDescriptor(_class2, "publishRemoveUserEvent"), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = UserMembership;