"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DOCUMENT_VERSION = void 0;
var _compact = _interopRequireDefault(require("lodash/compact"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _ProsemirrorHelper = require("./../../shared/utils/ProsemirrorHelper");
var _UrlHelper = require("./../../shared/utils/UrlHelper");
var _slugify = _interopRequireDefault(require("./../../shared/utils/slugify"));
var _validations = require("./../../shared/validations");
var _errors = require("./../errors");
var _url = require("./../utils/url");
var _Backlink = _interopRequireDefault(require("./Backlink"));
var _Collection = _interopRequireDefault(require("./Collection"));
var _FileOperation = _interopRequireDefault(require("./FileOperation"));
var _Group = _interopRequireDefault(require("./Group"));
var _GroupMembership = _interopRequireDefault(require("./GroupMembership"));
var _GroupUser = _interopRequireDefault(require("./GroupUser"));
var _Revision = _interopRequireDefault(require("./Revision"));
var _Star = _interopRequireDefault(require("./Star"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _UserMembership = _interopRequireDefault(require("./UserMembership"));
var _View = _interopRequireDefault(require("./View"));
var _ArchivableModel = _interopRequireDefault(require("./base/ArchivableModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _DocumentHelper = require("./helpers/DocumentHelper");
var _IsHexColor = _interopRequireDefault(require("./validators/IsHexColor"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _dec56, _dec57, _dec58, _dec59, _dec60, _dec61, _dec62, _dec63, _dec64, _dec65, _dec66, _dec67, _dec68, _dec69, _dec70, _dec71, _dec72, _dec73, _dec74, _dec75, _dec76, _dec77, _dec78, _dec79, _dec80, _dec81, _dec82, _dec83, _dec84, _dec85, _dec86, _dec87, _dec88, _dec89, _dec90, _dec91, _dec92, _dec93, _dec94, _dec95, _dec96, _dec97, _dec98, _dec99, _dec100, _dec101, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39, _descriptor40;
/* eslint-disable lines-between-class-members */
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
const DOCUMENT_VERSION = exports.DOCUMENT_VERSION = 2;
let Document = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    model: _User.default,
    as: "createdBy",
    paranoid: false
  }, {
    model: _User.default,
    as: "updatedBy",
    paranoid: false
  }],
  where: {
    publishedAt: {
      [_sequelize.Op.ne]: null
    },
    sourceMetadata: {
      trial: {
        [_sequelize.Op.is]: null
      }
    }
  },
  attributes: {
    exclude: ["state"]
  }
})), _dec2 = (0, _sequelizeTypescript.Scopes)(() => ({
  withCollectionPermissions: function (userId) {
    let paranoid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return {
      include: [{
        attributes: ["id", "permission", "sharing", "teamId", "deletedAt"],
        model: userId ? _Collection.default.scope({
          method: ["withMembership", userId]
        }) : _Collection.default,
        as: "collection",
        paranoid
      }]
    };
  },
  withoutState: {
    attributes: {
      exclude: ["state"]
    }
  },
  withCollection: {
    include: [{
      model: _Collection.default,
      as: "collection"
    }]
  },
  withState: {
    attributes: {
      // resets to include the state column
      exclude: []
    }
  },
  withDrafts: {
    include: [{
      association: "createdBy",
      paranoid: false
    }, {
      association: "updatedBy",
      paranoid: false
    }]
  },
  withViews: userId => {
    if (!userId) {
      return {};
    }
    return {
      include: [{
        model: _View.default,
        as: "views",
        where: {
          userId
        },
        required: false,
        separate: true
      }]
    };
  },
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
        association: "groupMemberships",
        required: false,
        // use of "separate" property: sequelize breaks when there are
        // nested "includes" with alternating values for "required"
        // see https://github.com/sequelize/sequelize/issues/9869
        separate: true,
        // include for groups that are members of this document,
        // of which userId is a member of, resulting in:
        // GroupMembership [inner join] Group [inner join] GroupUser [where] userId
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
  },
  withAllMemberships: {
    include: [{
      association: "memberships",
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
          required: true
        }]
      }]
    }]
  }
})), _dec3 = (0, _sequelizeTypescript.Table)({
  tableName: "documents",
  modelName: "document"
}), _dec4 = (0, _sequelizeTypescript.Length)({
  min: 10,
  max: 10,
  msg: `urlId must be 10 characters`
}), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _Length.default)({
  max: _validations.DocumentValidation.maxTitleLength,
  msg: `Document title must be ${_validations.DocumentValidation.maxTitleLength} characters or less`
}), _dec7 = Reflect.metadata("design:type", String), _dec8 = (0, _Length.default)({
  max: _validations.DocumentValidation.maxSummaryLength,
  msg: `Document summary must be ${_validations.DocumentValidation.maxSummaryLength} characters or less`
}), _dec9 = Reflect.metadata("design:type", String), _dec10 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec11 = Reflect.metadata("design:type", Array), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.SMALLINT), _dec13 = Reflect.metadata("design:type", Number), _dec14 = (0, _sequelizeTypescript.Default)(false), _dec15 = Reflect.metadata("design:type", Boolean), _dec16 = (0, _sequelizeTypescript.Default)(false), _dec17 = Reflect.metadata("design:type", Boolean), _dec18 = Reflect.metadata("design:type", Boolean), _dec19 = (0, _sequelizeTypescript.Length)({
  max: 255,
  msg: `editorVersion must be 255 characters or less`
}), _dec20 = Reflect.metadata("design:type", String), _dec21 = (0, _Length.default)({
  max: 50,
  msg: `icon must be 50 characters or less`
}), _dec22 = Reflect.metadata("design:type", String), _dec23 = Reflect.metadata("design:type", String), _dec24 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.TEXT), _dec25 = Reflect.metadata("design:type", String), _dec26 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec27 = Reflect.metadata("design:type", typeof ProsemirrorData === "undefined" ? Object : ProsemirrorData), _dec28 = (0, _sequelizeTypescript.Length)({
  max: _validations.DocumentValidation.maxStateLength,
  msg: `Document collaborative state is too large, you must create a new document`
}), _dec29 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec30 = Reflect.metadata("design:type", typeof Uint8Array === "undefined" ? Object : Uint8Array), _dec31 = (0, _sequelizeTypescript.Default)(false), _dec32 = Reflect.metadata("design:type", Boolean), _dec33 = (0, _sequelizeTypescript.Default)(0), _dec34 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec35 = Reflect.metadata("design:type", Number), _dec36 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec37 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.UUID)), _dec38 = Reflect.metadata("design:type", Array), _dec39 = Reflect.metadata("design:type", Function), _dec40 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec41 = Reflect.metadata("design:type", Function), _dec42 = Reflect.metadata("design:paramtypes", [Object]), _dec43 = Reflect.metadata("design:type", Function), _dec44 = Reflect.metadata("design:paramtypes", [Object]), _dec45 = Reflect.metadata("design:type", Function), _dec46 = Reflect.metadata("design:paramtypes", [Object]), _dec47 = Reflect.metadata("design:type", Function), _dec48 = Reflect.metadata("design:paramtypes", [Object]), _dec49 = Reflect.metadata("design:type", Function), _dec50 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec51 = (0, _sequelizeTypescript.BelongsTo)(() => _FileOperation.default, "importId"), _dec52 = Reflect.metadata("design:type", typeof _FileOperation.default === "undefined" ? Object : _FileOperation.default), _dec53 = (0, _sequelizeTypescript.ForeignKey)(() => _FileOperation.default), _dec54 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec55 = Reflect.metadata("design:type", String), _dec56 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec57 = Reflect.metadata("design:type", typeof SourceMetadata === "undefined" ? Object : SourceMetadata), _dec58 = (0, _sequelizeTypescript.BelongsTo)(() => Document, "parentDocumentId"), _dec59 = Reflect.metadata("design:type", Object), _dec60 = (0, _sequelizeTypescript.ForeignKey)(() => Document), _dec61 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec62 = Reflect.metadata("design:type", String), _dec63 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "lastModifiedById"), _dec64 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec65 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec66 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec67 = Reflect.metadata("design:type", String), _dec68 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec69 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec70 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec71 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec72 = Reflect.metadata("design:type", String), _dec73 = (0, _sequelizeTypescript.BelongsTo)(() => Document, "templateId"), _dec74 = Reflect.metadata("design:type", Object), _dec75 = (0, _sequelizeTypescript.ForeignKey)(() => Document), _dec76 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec77 = Reflect.metadata("design:type", String), _dec78 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec79 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec80 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec81 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec82 = Reflect.metadata("design:type", String), _dec83 = (0, _sequelizeTypescript.BelongsTo)(() => _Collection.default, "collectionId"), _dec84 = Reflect.metadata("design:type", typeof _Collection.default === "undefined" ? Object : _Collection.default), _dec85 = (0, _sequelizeTypescript.BelongsToMany)(() => _User.default, () => _UserMembership.default), _dec86 = Reflect.metadata("design:type", Array), _dec87 = (0, _sequelizeTypescript.ForeignKey)(() => _Collection.default), _dec88 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec89 = Reflect.metadata("design:type", String), _dec90 = (0, _sequelizeTypescript.HasMany)(() => _UserMembership.default), _dec91 = Reflect.metadata("design:type", Array), _dec92 = (0, _sequelizeTypescript.HasMany)(() => _GroupMembership.default, "documentId"), _dec93 = Reflect.metadata("design:type", Array), _dec94 = (0, _sequelizeTypescript.HasMany)(() => _Revision.default), _dec95 = Reflect.metadata("design:type", Array), _dec96 = (0, _sequelizeTypescript.HasMany)(() => _Backlink.default), _dec97 = Reflect.metadata("design:type", Array), _dec98 = (0, _sequelizeTypescript.HasMany)(() => _Star.default), _dec99 = Reflect.metadata("design:type", Array), _dec100 = (0, _sequelizeTypescript.HasMany)(() => _View.default), _dec101 = Reflect.metadata("design:type", Array), _dec(_class = _dec2(_class = _dec3(_class = (0, _Fix.default)(_class = (_class2 = class Document extends _ArchivableModel.default {
  constructor() {
    var _this;
    super(...arguments);
    _this = this;
    _initializerDefineProperty(this, "urlId", _descriptor, this);
    _initializerDefineProperty(this, "title", _descriptor2, this);
    _initializerDefineProperty(this, "summary", _descriptor3, this);
    _initializerDefineProperty(this, "previousTitles", _descriptor4, this);
    _initializerDefineProperty(this, "version", _descriptor5, this);
    _initializerDefineProperty(this, "template", _descriptor6, this);
    _initializerDefineProperty(this, "fullWidth", _descriptor7, this);
    _initializerDefineProperty(this, "insightsEnabled", _descriptor8, this);
    /** The version of the editor last used to edit this document. */
    _initializerDefineProperty(this, "editorVersion", _descriptor9, this);
    /** An icon to use as the document icon. */
    _initializerDefineProperty(this, "icon", _descriptor10, this);
    /** The color of the icon. */
    _initializerDefineProperty(this, "color", _descriptor11, this);
    /**
     * The content of the document as Markdown.
     *
     * @deprecated Use `content` instead, or `DocumentHelper.toMarkdown` if exporting lossy markdown.
     * This column will be removed in a future migration.
     */
    _initializerDefineProperty(this, "text", _descriptor12, this);
    /**
     * The content of the document as JSON, this is a snapshot at the last time the state was saved.
     */
    _initializerDefineProperty(this, "content", _descriptor13, this);
    /**
     * The content of the document as YJS collaborative state, this column can be quite large and
     * should only be selected from the DB when the `content` snapshot cannot be used.
     */
    _initializerDefineProperty(this, "state", _descriptor14, this);
    /** Whether this document is part of onboarding. */
    _initializerDefineProperty(this, "isWelcome", _descriptor15, this);
    /** How many versions there are in the history of this document. */
    _initializerDefineProperty(this, "revisionCount", _descriptor16, this);
    /** Whether the document is published, and if so when. */
    _initializerDefineProperty(this, "publishedAt", _descriptor17, this);
    /** An array of user IDs that have edited this document. */
    _initializerDefineProperty(this, "collaboratorIds", _descriptor18, this);
    // associations
    _initializerDefineProperty(this, "import", _descriptor19, this);
    _initializerDefineProperty(this, "importId", _descriptor20, this);
    _initializerDefineProperty(this, "sourceMetadata", _descriptor21, this);
    _initializerDefineProperty(this, "parentDocument", _descriptor22, this);
    _initializerDefineProperty(this, "parentDocumentId", _descriptor23, this);
    _initializerDefineProperty(this, "updatedBy", _descriptor24, this);
    _initializerDefineProperty(this, "lastModifiedById", _descriptor25, this);
    _initializerDefineProperty(this, "createdBy", _descriptor26, this);
    _initializerDefineProperty(this, "createdById", _descriptor27, this);
    _initializerDefineProperty(this, "document", _descriptor28, this);
    _initializerDefineProperty(this, "templateId", _descriptor29, this);
    _initializerDefineProperty(this, "team", _descriptor30, this);
    _initializerDefineProperty(this, "teamId", _descriptor31, this);
    _initializerDefineProperty(this, "collection", _descriptor32, this);
    _initializerDefineProperty(this, "users", _descriptor33, this);
    _initializerDefineProperty(this, "collectionId", _descriptor34, this);
    _initializerDefineProperty(this, "memberships", _descriptor35, this);
    _initializerDefineProperty(this, "groupMemberships", _descriptor36, this);
    _initializerDefineProperty(this, "revisions", _descriptor37, this);
    _initializerDefineProperty(this, "backlinks", _descriptor38, this);
    _initializerDefineProperty(this, "starred", _descriptor39, this);
    _initializerDefineProperty(this, "views", _descriptor40, this);
    /**
     * Revert the state of the document to match the passed revision.
     *
     * @param revision The revision to revert to.
     */
    _defineProperty(this, "restoreFromRevision", revision => {
      if (revision.documentId !== this.id) {
        throw new Error("Revision does not belong to this document");
      }
      this.content = revision.content;
      this.text = revision.text;
      this.title = revision.title;
      this.icon = revision.icon;
      this.color = revision.color;
    });
    /**
     * Get a list of users that have collaborated on this document
     *
     * @param options FindOptions
     * @returns A promise that resolve to a list of users
     */
    _defineProperty(this, "collaborators", async options => await _User.default.findAll({
      ...options,
      where: {
        ...options?.where,
        id: this.collaboratorIds
      }
    }));
    /**
     * Find all of the child documents for this document
     *
     * @param options FindOptions
     * @returns A promise that resolve to a list of documents
     */
    _defineProperty(this, "findChildDocuments", async (where, options) => await this.constructor.findAll({
      where: {
        parentDocumentId: this.id,
        ...where
      },
      ...options
    }));
    /**
     * Calculate all of the document ids that are children of this document by
     * recursively iterating through parentDocumentId references in the most efficient way.
     *
     * @param where query options to further filter the documents
     * @param options FindOptions
     * @returns A promise that resolves to a list of document ids
     */
    _defineProperty(this, "findAllChildDocumentIds", async (where, options) => {
      const findAllChildDocumentIds = async function () {
        for (var _len = arguments.length, parentDocumentId = new Array(_len), _key = 0; _key < _len; _key++) {
          parentDocumentId[_key] = arguments[_key];
        }
        const childDocuments = await _this.constructor.findAll({
          attributes: ["id"],
          where: {
            parentDocumentId,
            ...where
          },
          ...options
        });
        const childDocumentIds = childDocuments.map(doc => doc.id);
        if (childDocumentIds.length > 0) {
          return [...childDocumentIds, ...(await findAllChildDocumentIds(...childDocumentIds))];
        }
        return childDocumentIds;
      };
      return findAllChildDocumentIds(this.id);
    });
    _defineProperty(this, "publish", async (user, collectionId, options) => {
      const {
        transaction
      } = options;

      // If the document is already published then calling publish should act like
      // a regular save
      if (this.publishedAt) {
        return this.save(options);
      }
      if (!this.collectionId) {
        this.collectionId = collectionId;
      }
      if (!this.template && this.collectionId) {
        const collection = await _Collection.default.findByPk(this.collectionId, {
          transaction,
          lock: _sequelize.Transaction.LOCK.UPDATE
        });
        if (collection) {
          await collection.addDocumentToStructure(this, 0, {
            transaction
          });
          if (this.collection) {
            this.collection.documentStructure = collection.documentStructure;
          }
        }
      }

      // Copy the group and user memberships from the parent document, if any
      if (this.parentDocumentId) {
        await _GroupMembership.default.copy({
          documentId: this.parentDocumentId
        }, this, {
          transaction
        });
        await _UserMembership.default.copy({
          documentId: this.parentDocumentId
        }, this, {
          transaction
        });
      }
      this.lastModifiedById = user.id;
      this.updatedBy = user;
      this.publishedAt = new Date();
      return this.save(options);
    });
    _defineProperty(this, "isCollectionDeleted", async () => {
      if (this.deletedAt || this.archivedAt) {
        if (this.collectionId) {
          const collection = this.collection ?? (await _Collection.default.findByPk(this.collectionId, {
            attributes: ["deletedAt"],
            paranoid: false
          }));
          return !!collection?.deletedAt;
        }
      }
      return false;
    });
    _defineProperty(this, "unpublish", async user => {
      // If the document is already a draft then calling unpublish should act like save
      if (!this.publishedAt) {
        return this.save();
      }
      await this.sequelize.transaction(async transaction => {
        const collection = this.collectionId ? await _Collection.default.findByPk(this.collectionId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        }) : undefined;
        if (collection) {
          await collection.removeDocumentInStructure(this, {
            transaction
          });
          if (this.collection) {
            this.collection.documentStructure = collection.documentStructure;
          }
        }
      });

      // unpublishing a document converts the ownership to yourself, so that it
      // will appear in your drafts rather than the original creators
      this.createdById = user.id;
      this.lastModifiedById = user.id;
      this.createdBy = user;
      this.updatedBy = user;
      this.publishedAt = null;
      return this.save();
    });
    // Moves a document from being visible to the team within a collection
    // to the archived area, where it can be subsequently restored.
    _defineProperty(this, "archive", async (user, options) => {
      const {
        transaction
      } = {
        ...options
      };
      const collection = this.collectionId ? await _Collection.default.findByPk(this.collectionId, {
        transaction,
        lock: transaction?.LOCK.UPDATE
      }) : undefined;
      if (collection) {
        await collection.removeDocumentInStructure(this, {
          transaction
        });
        if (this.collection) {
          this.collection.documentStructure = collection.documentStructure;
        }
      }
      await this.archiveWithChildren(user, {
        transaction
      });
      return this;
    });
    // Restore an archived document back to being visible to the team
    _defineProperty(this, "restoreTo", async (collectionId, options) => {
      const {
        transaction
      } = {
        ...options
      };
      const collection = collectionId ? await _Collection.default.findByPk(collectionId, {
        transaction,
        lock: transaction?.LOCK.UPDATE
      }) : undefined;

      // check to see if the documents parent hasn't been archived also
      // If it has then restore the document to the collection root.
      if (this.parentDocumentId) {
        const parent = await this.constructor.findOne({
          where: {
            id: this.parentDocumentId
          },
          transaction
        });
        if (parent?.isDraft || !parent?.isActive) {
          this.parentDocumentId = null;
        }
      }
      if (!this.template && this.publishedAt && collection?.isActive) {
        await collection.addDocumentToStructure(this, undefined, {
          includeArchived: true,
          transaction
        });
      }
      if (this.deletedAt) {
        await this.restore({
          transaction
        });
        this.collectionId = collectionId;
        await this.save({
          transaction
        });
      }
      if (this.archivedAt) {
        await this.restoreWithChildren(collectionId, options.user, {
          transaction
        });
      }
      if (this.collection && collection) {
        // updating the document structure in memory just in case it's later accessed somewhere
        this.collection.documentStructure = collection.documentStructure;
      }
      return this;
    });
    // Delete a document, archived or otherwise.
    _defineProperty(this, "delete", user => this.sequelize.transaction(async transaction => {
      if (!this.archivedAt && !this.template && this.collectionId) {
        // delete any children and remove from the document structure
        const collection = await _Collection.default.findByPk(this.collectionId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
          paranoid: false
        });
        await collection?.deleteDocument(this, {
          transaction
        });
      } else {
        await this.destroy({
          transaction
        });
      }
      this.lastModifiedById = user.id;
      this.updatedBy = user;
      return this.save({
        transaction
      });
    }));
    _defineProperty(this, "getTimestamp", () => Math.round(new Date(this.updatedAt).getTime() / 1000));
    _defineProperty(this, "getSummary", () => {
      if (this.summary) {
        return this.summary;
      }
      const plainText = _DocumentHelper.DocumentHelper.toPlainText(this);
      const lines = (0, _compact.default)(plainText.split("\n"));
      const notEmpty = lines.length >= 1;
      if (this.version) {
        return notEmpty ? lines[0] : "";
      }
      return notEmpty ? lines[1] : "";
    });
    /**
     * Returns a JSON representation of the document suitable for use in the
     * collection documentStructure.
     *
     * @param options Optional transaction to use for the query
     * @returns Promise resolving to a NavigationNode
     */
    _defineProperty(this, "toNavigationNode", async options => {
      // Checking if the record is new is a performance optimization – new docs cannot have children
      const childDocuments = this.isNewRecord ? [] : await this.constructor.unscoped().findAll({
        where: options?.includeArchived ? {
          teamId: this.teamId,
          parentDocumentId: this.id,
          publishedAt: {
            [_sequelize.Op.ne]: null
          }
        } : {
          teamId: this.teamId,
          parentDocumentId: this.id,
          publishedAt: {
            [_sequelize.Op.ne]: null
          },
          archivedAt: {
            [_sequelize.Op.is]: null
          }
        },
        transaction: options?.transaction
      });
      const children = await Promise.all(childDocuments.map(child => child.toNavigationNode(options)));
      return {
        id: this.id,
        title: this.title,
        url: this.url,
        icon: (0, _isNil.default)(this.icon) ? undefined : this.icon,
        color: (0, _isNil.default)(this.color) ? undefined : this.color,
        children
      };
    });
    _defineProperty(this, "restoreWithChildren", async (collectionId, user, options) => {
      const restoreChildren = async parentDocumentId => {
        const childDocuments = await this.constructor.findAll({
          where: {
            parentDocumentId
          },
          ...options
        });
        for (const child of childDocuments) {
          await restoreChildren(child.id);
          child.archivedAt = null;
          child.lastModifiedById = user.id;
          child.updatedBy = user;
          child.collectionId = collectionId;
          await child.save(options);
        }
      };
      await restoreChildren(this.id);
      this.archivedAt = null;
      this.lastModifiedById = user.id;
      this.updatedBy = user;
      this.collectionId = collectionId;
      return this.save(options);
    });
    _defineProperty(this, "archiveWithChildren", async (user, options) => {
      const archivedAt = new Date();

      // Helper to archive all child documents for a document
      const archiveChildren = async parentDocumentId => {
        const childDocuments = await this.constructor.findAll({
          where: {
            parentDocumentId
          },
          ...options
        });
        for (const child of childDocuments) {
          await archiveChildren(child.id);
          child.archivedAt = archivedAt;
          child.lastModifiedById = user.id;
          child.updatedBy = user;
          await child.save(options);
        }
      };
      await archiveChildren(this.id);
      this.archivedAt = archivedAt;
      this.lastModifiedById = user.id;
      this.updatedBy = user;
      return this.save(options);
    });
  }
  // getters

  /**
   * The frontend path to this document.
   *
   * @deprecated Use `path` instead.
   */
  get url() {
    return this.path;
  }

  /** The frontend path to this document. */
  get path() {
    if (!this.title) {
      return `/doc/untitled-${this.urlId}`;
    }
    const slugifiedTitle = (0, _slugify.default)(this.title);
    return `/doc/${slugifiedTitle}-${this.urlId}`;
  }
  get tasks() {
    return _ProsemirrorHelper.ProsemirrorHelper.getTasksSummary(_DocumentHelper.DocumentHelper.toProsemirror(this));
  }
  static getPath(_ref) {
    let {
      title,
      urlId
    } = _ref;
    if (!title.length) {
      return `/doc/untitled-${urlId}`;
    }
    return `/doc/${(0, _slugify.default)(title)}-${urlId}`;
  }

  // hooks

  static async updateCollectionStructure(model, _ref2) {
    let {
      transaction
    } = _ref2;
    // templates, drafts, and archived documents don't appear in the structure
    // and so never need to be updated when the title changes
    if (model.archivedAt || model.template || !model.publishedAt || !(model.changed("title") || model.changed("icon") || model.changed("color")) || !model.collectionId) {
      return;
    }
    const collection = await _Collection.default.findByPk(model.collectionId, {
      transaction,
      lock: _sequelize.Transaction.LOCK.UPDATE
    });
    if (!collection) {
      return;
    }
    await collection.updateDocument(model, {
      transaction
    });
    model.collection = collection;
  }
  static async addDocumentToCollectionStructure(model) {
    if (model.archivedAt || model.template || !model.publishedAt || !model.collectionId) {
      return;
    }
    return this.sequelize.transaction(async transaction => {
      const collection = await _Collection.default.findByPk(model.collectionId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!collection) {
        return;
      }
      await collection.addDocumentToStructure(model, 0, {
        transaction
      });
      model.collection = collection;
    });
  }
  static createUrlId(model) {
    return model.urlId = model.urlId || (0, _url.generateUrlId)();
  }
  static setDocumentVersion(model) {
    if (model.version === undefined) {
      model.version = DOCUMENT_VERSION;
    }
    return this.processUpdate(model);
  }
  static async processUpdate(model) {
    // ensure documents have a title
    model.title = model.title || "";
    const previousTitle = model.previous("title");
    if (previousTitle && previousTitle !== model.title) {
      if (!model.previousTitles) {
        model.previousTitles = [];
      }
      model.previousTitles = (0, _uniq.default)(model.previousTitles.concat(previousTitle));
    }

    // add the current user as a collaborator on this doc
    if (!model.collaboratorIds) {
      model.collaboratorIds = [];
    }

    // backfill content if it's missing
    if (!model.content) {
      model.content = await _DocumentHelper.DocumentHelper.toJSON(model);
    }

    // ensure the last modifying user is a collaborator
    model.collaboratorIds = (0, _uniq.default)(model.collaboratorIds.concat(model.lastModifiedById));

    // increment revision
    model.revisionCount += 1;
  }
  static async checkParentDocument(model, options) {
    if (model.previous("parentDocumentId") === model.parentDocumentId || !model.parentDocumentId) {
      return;
    }
    if (model.parentDocumentId === model.id) {
      throw (0, _errors.ValidationError)("infinite loop detected, cannot nest a document inside itself");
    }
    const childDocumentIds = await model.findAllChildDocumentIds(undefined, options);
    if (childDocumentIds.includes(model.parentDocumentId)) {
      throw (0, _errors.ValidationError)("infinite loop detected, cannot nest a document inside itself");
    }
  }
  /**
   * Returns an array of unique userIds that are members of a document
   * either via group or direct membership.
   *
   * @param documentId
   * @returns userIds
   */
  static async membershipUserIds(documentId) {
    const document = await this.scope("withAllMemberships").findOne({
      where: {
        id: documentId
      }
    });
    if (!document) {
      return [];
    }
    const groupMemberships = document.groupMemberships.map(gm => gm.group.groupUsers).flat();
    const membershipUserIds = [...groupMemberships, ...document.memberships].map(membership => membership.userId);
    return (0, _uniq.default)(membershipUserIds);
  }
  static defaultScopeWithUser(userId) {
    const collectionScope = {
      method: ["withCollectionPermissions", userId]
    };
    const viewScope = {
      method: ["withViews", userId]
    };
    const membershipScope = {
      method: ["withMembership", userId]
    };
    return this.scope(["defaultScope", collectionScope, viewScope, membershipScope]);
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
    const {
      includeState,
      userId,
      ...rest
    } = options;

    // allow default preloading of collection membership if `userId` is passed in find options
    // almost every endpoint needs the collection membership to determine policy permissions.
    const scope = this.scope(["withDrafts", {
      method: ["withCollectionPermissions", userId, rest.paranoid]
    }, {
      method: ["withViews", userId]
    }, {
      method: ["withMembership", userId]
    }]);
    if ((0, _isUUID.default)(id)) {
      const document = await scope.findOne({
        where: {
          id
        },
        ...rest,
        rejectOnEmpty: false
      });
      if (!document && rest.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Document doesn't exist with id: ${id}`);
      }
      return document;
    }
    const match = id.match(_UrlHelper.UrlHelper.SLUG_URL_REGEX);
    if (match) {
      const document = await scope.findOne({
        where: {
          urlId: match[1]
        },
        ...rest,
        rejectOnEmpty: false
      });
      if (!document && rest.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Document doesn't exist with id: ${id}`);
      }
      return document;
    }
    return null;
  }

  /**
   * Find many documents by their id, supports filtering by user memberships when `userId`
   * is specified in the options.
   *
   * @param ids An array of document ids
   * @param options FindOptions
   * @returns A promise resolving to the list of documents
   */
  static async findByIds(ids) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      userId,
      ...rest
    } = options;
    const user = userId ? await _User.default.findByPk(userId) : null;
    const documents = await this.scope(["withDrafts", {
      method: ["withCollectionPermissions", userId, rest.paranoid]
    }, {
      method: ["withViews", userId]
    }, {
      method: ["withMembership", userId]
    }]).findAll({
      where: {
        ...(user && {
          teamId: user.teamId
        }),
        id: ids
      },
      ...rest
    });
    if (!userId) {
      return documents;
    }
    return documents.filter(doc => !doc.collection?.isPrivate && !user?.isGuest || (doc.collection?.memberships.length || 0) > 0 || (doc.collection?.groupMemberships.length || 0) > 0 || doc.memberships.length > 0 || doc.groupMemberships.length > 0);
  }

  // instance methods

  /**
   * Whether this document is considered active or not. A document is active if
   * it has not been archived or deleted.
   *
   * @returns boolean
   */
  get isActive() {
    return !this.archivedAt && !this.deletedAt;
  }

  /**
   * Convenience method that returns whether this document is a draft.
   *
   * @returns boolean
   */
  get isDraft() {
    return !this.publishedAt;
  }

  /**
   * Returns the title of the document or a default if the document is untitled.
   *
   * @returns boolean
   */
  get titleWithDefault() {
    return this.title || "Untitled";
  }

  /**
   * Whether this document was imported during a trial period.
   *
   * @returns boolean
   */
  get isTrialImport() {
    return !!(this.importId && this.sourceMetadata?.trial);
  }

  /**
   * Returns whether this document is a template created at the workspace level.
   */
  get isWorkspaceTemplate() {
    return this.template && !this.collectionId;
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "urlId", [_dec4, _sequelizeTypescript.Unique, _sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec6, _sequelizeTypescript.Column, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "summary", [_dec8, _sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "previousTitles", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return [];
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "version", [_sequelizeTypescript.IsNumeric, _dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "template", [_dec14, _sequelizeTypescript.Column, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "fullWidth", [_dec16, _sequelizeTypescript.Column, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "insightsEnabled", [_sequelizeTypescript.Column, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "editorVersion", [_dec19, _sequelizeTypescript.Column, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "icon", [_dec21, _sequelizeTypescript.Column, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "color", [_IsHexColor.default, _sequelizeTypescript.Column, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "text", [_dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "state", [_dec28, _dec29, _dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "isWelcome", [_dec31, _sequelizeTypescript.Column, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "revisionCount", [_sequelizeTypescript.IsNumeric, _dec33, _dec34, _dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "publishedAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec36], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "collaboratorIds", [_dec37, _dec38], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return [];
  }
}), _applyDecoratedDescriptor(_class2, "updateCollectionStructure", [_sequelizeTypescript.BeforeSave, _dec39, _dec40], Object.getOwnPropertyDescriptor(_class2, "updateCollectionStructure"), _class2), _applyDecoratedDescriptor(_class2, "addDocumentToCollectionStructure", [_sequelizeTypescript.AfterCreate, _dec41, _dec42], Object.getOwnPropertyDescriptor(_class2, "addDocumentToCollectionStructure"), _class2), _applyDecoratedDescriptor(_class2, "createUrlId", [_sequelizeTypescript.BeforeValidate, _dec43, _dec44], Object.getOwnPropertyDescriptor(_class2, "createUrlId"), _class2), _applyDecoratedDescriptor(_class2, "setDocumentVersion", [_sequelizeTypescript.BeforeCreate, _dec45, _dec46], Object.getOwnPropertyDescriptor(_class2, "setDocumentVersion"), _class2), _applyDecoratedDescriptor(_class2, "processUpdate", [_sequelizeTypescript.BeforeUpdate, _dec47, _dec48], Object.getOwnPropertyDescriptor(_class2, "processUpdate"), _class2), _applyDecoratedDescriptor(_class2, "checkParentDocument", [_sequelizeTypescript.BeforeUpdate, _dec49, _dec50], Object.getOwnPropertyDescriptor(_class2, "checkParentDocument"), _class2), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "import", [_dec51, _dec52], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "importId", [_dec53, _dec54, _dec55], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "sourceMetadata", [_sequelizeTypescript.AllowNull, _dec56, _dec57], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "parentDocument", [_dec58, _dec59], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "parentDocumentId", [_dec60, _dec61, _dec62], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "updatedBy", [_dec63, _dec64], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "lastModifiedById", [_dec65, _dec66, _dec67], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec68, _dec69], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec70, _dec71, _dec72], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec73, _dec74], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "templateId", [_dec75, _dec76, _dec77], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec78, _dec79], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor31 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec80, _dec81, _dec82], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor32 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec83, _dec84], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor33 = _applyDecoratedDescriptor(_class2.prototype, "users", [_dec85, _dec86], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor34 = _applyDecoratedDescriptor(_class2.prototype, "collectionId", [_dec87, _dec88, _dec89], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor35 = _applyDecoratedDescriptor(_class2.prototype, "memberships", [_dec90, _dec91], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor36 = _applyDecoratedDescriptor(_class2.prototype, "groupMemberships", [_dec92, _dec93], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor37 = _applyDecoratedDescriptor(_class2.prototype, "revisions", [_dec94, _dec95], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor38 = _applyDecoratedDescriptor(_class2.prototype, "backlinks", [_dec96, _dec97], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor39 = _applyDecoratedDescriptor(_class2.prototype, "starred", [_dec98, _dec99], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor40 = _applyDecoratedDescriptor(_class2.prototype, "views", [_dec100, _dec101], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class) || _class);
var _default = exports.default = Document;