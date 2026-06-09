"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _find = _interopRequireDefault(require("lodash/find"));
var _findIndex = _interopRequireDefault(require("lodash/findIndex"));
var _remove = _interopRequireDefault(require("lodash/remove"));
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _types = require("./../../shared/types");
var _UrlHelper = require("./../../shared/utils/UrlHelper");
var _collections = require("./../../shared/utils/collections");
var _slugify = _interopRequireDefault(require("./../../shared/utils/slugify"));
var _validations = require("./../../shared/validations");
var _errors = require("./../errors");
var _url = require("./../utils/url");
var _Document = _interopRequireDefault(require("./Document"));
var _FileOperation = _interopRequireDefault(require("./FileOperation"));
var _Group = _interopRequireDefault(require("./Group"));
var _GroupMembership = _interopRequireDefault(require("./GroupMembership"));
var _GroupUser = _interopRequireDefault(require("./GroupUser"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _UserMembership = _interopRequireDefault(require("./UserMembership"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _DocumentHelper = require("./helpers/DocumentHelper");
var _IsHexColor = _interopRequireDefault(require("./validators/IsHexColor"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _NotContainsUrl = _interopRequireDefault(require("./validators/NotContainsUrl"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _dec56, _dec57, _dec58, _dec59, _dec60, _dec61, _dec62, _dec63, _dec64, _dec65, _dec66, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _Collection;
/* eslint-disable lines-between-class-members */
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Collection = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withAllMemberships: {
    include: [{
      model: _UserMembership.default,
      as: "memberships",
      required: false
    }, {
      model: _GroupMembership.default,
      as: "groupMemberships",
      required: false,
      // use of "separate" property: sequelize breaks when there are
      // nested "includes" with alternating values for "required"
      // see https://github.com/sequelize/sequelize/issues/9869
      separate: true,
      // include for groups that are members of this collection,
      // of which userId is a member of, resulting in:
      // GroupMembership [inner join] Group [inner join] GroupUser [where] userId
      include: [{
        model: _Group.default,
        as: "group",
        required: true,
        include: [{
          model: _GroupUser.default,
          as: "groupUsers",
          required: true
        }]
      }]
    }]
  },
  withUser: () => ({
    include: [{
      model: _User.default,
      required: true,
      as: "user"
    }]
  }),
  withArchivedBy: () => ({
    include: [{
      association: "archivedBy"
    }]
  }),
  withMembership: userId => {
    if (!userId) {
      return {};
    }
    return {
      include: [{
        association: "memberships",
        where: {
          userId
        },
        required: false
      }, {
        model: _GroupMembership.default,
        as: "groupMemberships",
        required: false,
        // use of "separate" property: sequelize breaks when there are
        // nested "includes" with alternating values for "required"
        // see https://github.com/sequelize/sequelize/issues/9869
        separate: true,
        // include for groups that are members of this collection,
        // of which userId is a member of, resulting in:
        // CollectionGroup [inner join] Group [inner join] GroupUser [where] userId
        include: [{
          model: _Group.default,
          as: "group",
          required: true,
          include: [{
            model: _GroupUser.default,
            as: "groupUsers",
            required: true,
            where: {
              userId
            }
          }]
        }]
      }]
    };
  }
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "collections",
  modelName: "collection"
}), _dec3 = (0, _sequelizeTypescript.Length)({
  min: 10,
  max: 10,
  msg: `urlId must be 10 characters`
}), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _Length.default)({
  max: _validations.CollectionValidation.maxNameLength,
  msg: `name must be ${_validations.CollectionValidation.maxNameLength} characters or less`
}), _dec6 = Reflect.metadata("design:type", String), _dec7 = (0, _Length.default)({
  max: _validations.CollectionValidation.maxDescriptionLength,
  msg: `description must be ${_validations.CollectionValidation.maxDescriptionLength} characters or less`
}), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec10 = Reflect.metadata("design:type", typeof ProsemirrorData === "undefined" ? Object : ProsemirrorData), _dec11 = (0, _Length.default)({
  max: 50,
  msg: `icon must be 50 characters or less`
}), _dec12 = Reflect.metadata("design:type", String), _dec13 = Reflect.metadata("design:type", String), _dec14 = (0, _Length.default)({
  max: 256,
  msg: `index must be 256 characters or less`
}), _dec15 = Reflect.metadata("design:type", String), _dec16 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.CollectionPermission)]), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec18 = Reflect.metadata("design:type", typeof _types.CollectionPermission === "undefined" ? Object : _types.CollectionPermission), _dec19 = (0, _sequelizeTypescript.Default)(false), _dec20 = Reflect.metadata("design:type", Boolean), _dec21 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec22 = Reflect.metadata("design:type", Array), _dec23 = (0, _sequelizeTypescript.Default)(true), _dec24 = Reflect.metadata("design:type", Boolean), _dec25 = (0, _sequelizeTypescript.Default)({
  field: "title",
  direction: "asc"
}), _dec26 = (0, _sequelizeTypescript.Column)({
  type: _sequelizeTypescript.DataType.JSONB,
  validate: {
    isSort(value) {
      if (typeof value !== "object" || !value.direction || !value.field || Object.keys(value).length !== 2) {
        throw new Error("Sort must be an object with field,direction");
      }
      if (!["asc", "desc"].includes(value.direction)) {
        throw new Error("Sort direction must be one of asc,desc");
      }
      if (!["title", "index"].includes(value.field)) {
        throw new Error("Sort field must be one of title,index");
      }
    }
  }
}), _dec27 = Reflect.metadata("design:type", typeof CollectionSort === "undefined" ? Object : CollectionSort), _dec28 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec29 = Reflect.metadata("design:type", Function), _dec30 = Reflect.metadata("design:paramtypes", [Object]), _dec31 = Reflect.metadata("design:type", Function), _dec32 = Reflect.metadata("design:paramtypes", [Object]), _dec33 = Reflect.metadata("design:type", Function), _dec34 = Reflect.metadata("design:paramtypes", [Object]), _dec35 = Reflect.metadata("design:type", Function), _dec36 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec37 = (0, _sequelizeTypescript.BelongsTo)(() => _FileOperation.default, "importId"), _dec38 = Reflect.metadata("design:type", typeof _FileOperation.default === "undefined" ? Object : _FileOperation.default), _dec39 = (0, _sequelizeTypescript.ForeignKey)(() => _FileOperation.default), _dec40 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec41 = Reflect.metadata("design:type", String), _dec42 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "archivedById"), _dec43 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec44 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec45 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec46 = Reflect.metadata("design:type", String), _dec47 = (0, _sequelizeTypescript.HasMany)(() => _Document.default, "collectionId"), _dec48 = Reflect.metadata("design:type", Array), _dec49 = (0, _sequelizeTypescript.HasMany)(() => _UserMembership.default, "collectionId"), _dec50 = Reflect.metadata("design:type", Array), _dec51 = (0, _sequelizeTypescript.HasMany)(() => _GroupMembership.default, "collectionId"), _dec52 = Reflect.metadata("design:type", Array), _dec53 = (0, _sequelizeTypescript.BelongsToMany)(() => _User.default, () => _UserMembership.default), _dec54 = Reflect.metadata("design:type", Array), _dec55 = (0, _sequelizeTypescript.BelongsToMany)(() => _Group.default, () => _GroupMembership.default), _dec56 = Reflect.metadata("design:type", Array), _dec57 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec58 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec59 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec60 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec61 = Reflect.metadata("design:type", String), _dec62 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec63 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec64 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec65 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec66 = Reflect.metadata("design:type", String), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = (_Collection = class Collection extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "urlId", _descriptor, this);
    _initializerDefineProperty(this, "name", _descriptor2, this);
    /**
     * The content of the collection as Markdown.
     *
     * @deprecated Use `content` instead, or `DocumentHelper.toMarkdown` if exporting lossy markdown.
     * This column will be removed in a future migration.
     */
    _initializerDefineProperty(this, "description", _descriptor3, this);
    /**
     * The content of the collection as JSON, this is a snapshot at the last time the state was saved.
     */
    _initializerDefineProperty(this, "content", _descriptor4, this);
    /** An icon (or) emoji to use as the collection icon. */
    _initializerDefineProperty(this, "icon", _descriptor5, this);
    /** The color of the icon. */
    _initializerDefineProperty(this, "color", _descriptor6, this);
    _initializerDefineProperty(this, "index", _descriptor7, this);
    _initializerDefineProperty(this, "permission", _descriptor8, this);
    _initializerDefineProperty(this, "maintainerApprovalRequired", _descriptor9, this);
    _initializerDefineProperty(this, "documentStructure", _descriptor10, this);
    _initializerDefineProperty(this, "sharing", _descriptor11, this);
    _initializerDefineProperty(this, "sort", _descriptor12, this);
    /** Whether the collection is archived, and if so when. */
    _initializerDefineProperty(this, "archivedAt", _descriptor13, this);
    // associations
    _initializerDefineProperty(this, "import", _descriptor14, this);
    _initializerDefineProperty(this, "importId", _descriptor15, this);
    _initializerDefineProperty(this, "archivedBy", _descriptor16, this);
    _initializerDefineProperty(this, "archivedById", _descriptor17, this);
    _initializerDefineProperty(this, "documents", _descriptor18, this);
    _initializerDefineProperty(this, "memberships", _descriptor19, this);
    _initializerDefineProperty(this, "groupMemberships", _descriptor20, this);
    _initializerDefineProperty(this, "users", _descriptor21, this);
    _initializerDefineProperty(this, "groups", _descriptor22, this);
    _initializerDefineProperty(this, "user", _descriptor23, this);
    _initializerDefineProperty(this, "createdById", _descriptor24, this);
    _initializerDefineProperty(this, "team", _descriptor25, this);
    _initializerDefineProperty(this, "teamId", _descriptor26, this);
    _defineProperty(this, "getDocumentTree", documentId => {
      if (!this.documentStructure) {
        return null;
      }
      let result;
      const loopChildren = documents => {
        if (result) {
          return;
        }
        documents.forEach(document => {
          if (result) {
            return;
          }
          if (document.id === documentId) {
            result = document;
          } else {
            loopChildren(document.children);
          }
        });
      };

      // Technically, sorting the children is presenter-layer work...
      // but the only place it's used passes straight into an API response
      // so the extra indirection is not worthwhile
      loopChildren(this.documentStructure);

      // if the document is a draft loopChildren will not find it in the structure
      if (!result) {
        return null;
      }
      return {
        ...result,
        children: (0, _collections.sortNavigationNodes)(result.children, this.sort)
      };
    });
    _defineProperty(this, "deleteDocument", async function (document, options) {
      await this.removeDocumentInStructure(document, options);

      // Helper to destroy all child documents for a document
      const loopChildren = async (documentId, opts) => {
        const childDocuments = await _Document.default.findAll({
          where: {
            parentDocumentId: documentId
          }
        });
        for (const child of childDocuments) {
          await loopChildren(child.id, opts);
          await child.destroy(opts);
        }
      };
      await loopChildren(document.id, options);
      await document.destroy(options);
    });
    _defineProperty(this, "removeDocumentInStructure", async function (document, options) {
      if (!this.documentStructure) {
        return;
      }
      let result;
      const removeFromChildren = async (children, id) => {
        children = await Promise.all(children.map(async childDocument => ({
          ...childDocument,
          children: await removeFromChildren(childDocument.children, id)
        })));
        const match = (0, _find.default)(children, {
          id
        });
        if (match) {
          if (!result) {
            result = [match, (0, _findIndex.default)(children, {
              id
            })];
          }
          (0, _remove.default)(children, {
            id
          });
        }
        return children;
      };
      this.documentStructure = await removeFromChildren(this.documentStructure, document.id);

      // Sequelize doesn't seem to set the value with splice on JSONB field
      // https://github.com/sequelize/sequelize/blob/e1446837196c07b8ff0c23359b958d68af40fd6d/src/model.js#L3937
      this.changed("documentStructure", true);
      if (options?.save !== false) {
        await this.save({
          ...options,
          fields: ["documentStructure"]
        });
      }
      return result;
    });
    _defineProperty(this, "getDocumentParents", function (documentId) {
      let result;
      const loopChildren = function (documents) {
        let path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        if (result) {
          return;
        }
        documents.forEach(document => {
          if (document.id === documentId) {
            result = path;
          } else {
            loopChildren(document.children, [...path, document.id]);
          }
        });
      };
      if (this.documentStructure) {
        loopChildren(this.documentStructure);
      }
      return result;
    });
    /**
     * Update document's title and url in the documentStructure
     */
    _defineProperty(this, "updateDocument", async function (updatedDocument, options) {
      if (!this.documentStructure) {
        return;
      }
      const {
        id
      } = updatedDocument;
      const updateChildren = documents => Promise.all(documents.map(async document => {
        if (document.id === id) {
          document = {
            ...(await updatedDocument.toNavigationNode(options)),
            children: document.children
          };
        } else {
          document.children = await updateChildren(document.children);
        }
        return document;
      }));
      this.documentStructure = await updateChildren(this.documentStructure);
      // Sequelize doesn't seem to set the value with splice on JSONB field
      // https://github.com/sequelize/sequelize/blob/e1446837196c07b8ff0c23359b958d68af40fd6d/src/model.js#L3937
      this.changed("documentStructure", true);
      await this.save({
        fields: ["documentStructure"],
        ...options
      });
      return this;
    });
    _defineProperty(this, "addDocumentToStructure", async function (document, index) {
      let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (!this.documentStructure) {
        this.documentStructure = [];
      }
      if (this.getDocumentTree(document.id)) {
        return this;
      }

      // If moving existing document with children, use existing structure
      const documentJson = {
        ...(await document.toNavigationNode(options)),
        ...options.documentJson
      };
      if (!document.parentDocumentId) {
        // Note: Index is supported on DB level but it's being ignored
        // by the API presentation until we build product support for it.
        this.documentStructure.splice(index !== undefined ? index : this.documentStructure.length, 0, documentJson);
      } else {
        // Recursively place document
        const placeDocument = documentList => documentList.map(childDocument => {
          if (document.parentDocumentId === childDocument.id) {
            childDocument.children.splice(index !== undefined ? index : childDocument.children.length, 0, documentJson);
          } else {
            childDocument.children = placeDocument(childDocument.children);
          }
          return childDocument;
        });
        this.documentStructure = placeDocument(this.documentStructure);
      }

      // Sequelize doesn't seem to set the value with splice on JSONB field
      // https://github.com/sequelize/sequelize/blob/e1446837196c07b8ff0c23359b958d68af40fd6d/src/model.js#L3937
      this.changed("documentStructure", true);
      if (options?.save !== false) {
        await this.save({
          ...options,
          fields: ["documentStructure"]
        });
      }
      return this;
    });
  }
  // getters

  /**
   * The frontend path to this collection.
   *
   * @deprecated Use `path` instead.
   */
  get url() {
    return this.path;
  }

  /** The frontend path to this collection. */
  get path() {
    if (!this.name) {
      return `/collection/untitled-${this.urlId}`;
    }
    return `/collection/${(0, _slugify.default)(this.name)}-${this.urlId}`;
  }

  /**
   * Whether this collection is considered active or not. A collection is active if
   * it has not been archived or deleted.
   *
   * @returns boolean
   */
  get isActive() {
    return !this.archivedAt && !this.deletedAt;
  }

  // hooks

  static async onBeforeValidate(model) {
    model.urlId = model.urlId || (0, _url.generateUrlId)();
  }
  static async onBeforeSave(model) {
    if (!model.content) {
      model.content = await _DocumentHelper.DocumentHelper.toJSON(model);
    }
  }
  static async checkLastCollection(model) {
    const total = await this.count({
      where: {
        teamId: model.teamId
      }
    });
    if (total === 1) {
      throw (0, _errors.ValidationError)("Cannot delete last collection");
    }
  }
  static async onAfterCreate(model, options) {
    return _UserMembership.default.findOrCreate({
      where: {
        collectionId: model.id,
        userId: model.createdById
      },
      defaults: {
        permission: _types.CollectionPermission.Admin,
        createdById: model.createdById
      },
      transaction: options.transaction,
      hooks: false
    });
  }
  /**
   * Returns an array of unique userIds that are members of a collection,
   * either via group or direct membership.
   *
   * @param collectionId
   * @returns userIds
   */
  static async membershipUserIds(collectionId) {
    const collection = await this.scope("withAllMemberships").findByPk(collectionId);
    if (!collection) {
      return [];
    }
    const groupMemberships = collection.groupMemberships.map(gm => gm.group.groupUsers).flat();
    const membershipUserIds = [...groupMemberships, ...collection.memberships].map(membership => membership.userId);
    return (0, _uniq.default)(membershipUserIds);
  }

  /**
   * Overrides the standard findByPk behavior to allow also querying by urlId
   *
   * @param id uuid or urlId
   * @param options FindOptions
   * @returns A promise resolving to a collection instance or null
   */

  static async findByPk(id) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof id !== "string") {
      return null;
    }
    if ((0, _isUUID.default)(id)) {
      const collection = await this.findOne({
        where: {
          id
        },
        ...options,
        rejectOnEmpty: false
      });
      if (!collection && options.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Collection doesn't exist with id: ${id}`);
      }
      return collection;
    }
    const match = id.match(_UrlHelper.UrlHelper.SLUG_URL_REGEX);
    if (match) {
      const collection = await this.findOne({
        where: {
          urlId: match[1]
        },
        ...options,
        rejectOnEmpty: false
      });
      if (!collection && options.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Collection doesn't exist with id: ${id}`);
      }
      return collection;
    }
    return null;
  }

  /**
   * Find the first collection that the specified user has access to.
   *
   * @param user User to find the collection for
   * @param options Additional options for the query
   * @returns collection First collection in the sidebar order
   */
  static async findFirstCollectionForUser(user) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const id = await user.collectionIds();
    return this.findOne({
      where: {
        teamId: user.teamId,
        id
      },
      order: [
      // using LC_COLLATE:"C" because we need byte order to drive the sorting
      _sequelizeTypescript.Sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]],
      ...options
    });
  }

  /**
   * Convenience method to return if a collection is considered private.
   * This means that a membership is required to view it rather than just being
   * a workspace member.
   *
   * @returns boolean
   */
  get isPrivate() {
    return !this.permission;
  }
}, _defineProperty(_Collection, "DEFAULT_SORT", {
  field: "index",
  direction: "asc"
}), _Collection), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "urlId", [_dec3, _sequelizeTypescript.Unique, _sequelizeTypescript.Column, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_NotContainsUrl.default, _dec5, _sequelizeTypescript.Column, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "description", [_dec7, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "icon", [_dec11, _sequelizeTypescript.Column, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "color", [_IsHexColor.default, _sequelizeTypescript.Column, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "index", [_dec14, _sequelizeTypescript.Column, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "permission", [_dec16, _dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "maintainerApprovalRequired", [_dec19, _sequelizeTypescript.Column, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "documentStructure", [_dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "sharing", [_dec23, _sequelizeTypescript.Column, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "sort", [_dec25, _dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "archivedAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "onBeforeValidate", [_sequelizeTypescript.BeforeValidate, _dec29, _dec30], Object.getOwnPropertyDescriptor(_class2, "onBeforeValidate"), _class2), _applyDecoratedDescriptor(_class2, "onBeforeSave", [_sequelizeTypescript.BeforeSave, _dec31, _dec32], Object.getOwnPropertyDescriptor(_class2, "onBeforeSave"), _class2), _applyDecoratedDescriptor(_class2, "checkLastCollection", [_sequelizeTypescript.BeforeDestroy, _dec33, _dec34], Object.getOwnPropertyDescriptor(_class2, "checkLastCollection"), _class2), _applyDecoratedDescriptor(_class2, "onAfterCreate", [_sequelizeTypescript.AfterCreate, _dec35, _dec36], Object.getOwnPropertyDescriptor(_class2, "onAfterCreate"), _class2), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "import", [_dec37, _dec38], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "importId", [_dec39, _dec40, _dec41], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "archivedBy", [_dec42, _dec43], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "archivedById", [_sequelizeTypescript.AllowNull, _dec44, _dec45, _dec46], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "documents", [_dec47, _dec48], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "memberships", [_dec49, _dec50], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "groupMemberships", [_dec51, _dec52], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "users", [_dec53, _dec54], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "groups", [_dec55, _dec56], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec57, _dec58], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec59, _dec60, _dec61], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec62, _dec63], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec64, _dec65, _dec66], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class);
var _default = exports.default = Collection;