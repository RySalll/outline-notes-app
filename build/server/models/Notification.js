"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _sequelizeTypescript = require("sequelize-typescript");
var _types = require("./../../shared/types");
var _domains = require("./../../shared/utils/domains");
var _env = _interopRequireDefault(require("./../env"));
var _Model = _interopRequireDefault(require("./base/Model"));
var _Collection = _interopRequireDefault(require("./Collection"));
var _Comment = _interopRequireDefault(require("./Comment"));
var _Document = _interopRequireDefault(require("./Document"));
var _Event = _interopRequireDefault(require("./Event"));
var _Revision = _interopRequireDefault(require("./Revision"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let baseDomain;
let Notification = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withTeam: {
    include: [{
      association: "team"
    }]
  },
  withDocument: {
    include: [{
      association: "document"
    }]
  },
  withComment: {
    include: [{
      association: "comment"
    }]
  },
  withActor: {
    include: [{
      association: "actor"
    }]
  },
  withUser: {
    include: [{
      association: "user"
    }]
  }
})), _dec2 = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    association: "document",
    required: false
  }, {
    association: "comment",
    required: false
  }, {
    association: "actor",
    required: false
  }]
})), _dec3 = (0, _sequelizeTypescript.Table)({
  tableName: "notifications",
  modelName: "notification",
  updatedAt: false
}), _dec4 = (0, _sequelizeTypescript.IsUUID)(4), _dec5 = (0, _sequelizeTypescript.Default)(_sequelizeTypescript.DataType.UUIDV4), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec7 = Reflect.metadata("design:type", String), _dec8 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec9 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec10 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec11 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec13 = Reflect.metadata("design:type", typeof _types.NotificationEventType === "undefined" ? Object : _types.NotificationEventType), _dec14 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec15 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec16 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec18 = Reflect.metadata("design:type", String), _dec19 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "actorId"), _dec20 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec21 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec23 = Reflect.metadata("design:type", String), _dec24 = (0, _sequelizeTypescript.BelongsTo)(() => _Comment.default, "commentId"), _dec25 = Reflect.metadata("design:type", typeof _Comment.default === "undefined" ? Object : _Comment.default), _dec26 = (0, _sequelizeTypescript.ForeignKey)(() => _Comment.default), _dec27 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec28 = Reflect.metadata("design:type", String), _dec29 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec30 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec31 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec32 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec33 = Reflect.metadata("design:type", String), _dec34 = (0, _sequelizeTypescript.BelongsTo)(() => _Revision.default, "revisionId"), _dec35 = Reflect.metadata("design:type", typeof _Revision.default === "undefined" ? Object : _Revision.default), _dec36 = (0, _sequelizeTypescript.ForeignKey)(() => _Revision.default), _dec37 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec38 = Reflect.metadata("design:type", String), _dec39 = (0, _sequelizeTypescript.BelongsTo)(() => _Collection.default, "collectionId"), _dec40 = Reflect.metadata("design:type", typeof _Collection.default === "undefined" ? Object : _Collection.default), _dec41 = (0, _sequelizeTypescript.ForeignKey)(() => _Collection.default), _dec42 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec43 = Reflect.metadata("design:type", String), _dec44 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec45 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec46 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec47 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec48 = Reflect.metadata("design:type", String), _dec49 = Reflect.metadata("design:type", Function), _dec50 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec(_class = _dec2(_class = _dec3(_class = (0, _Fix.default)(_class = (_class2 = class Notification extends _Model.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "id", _descriptor, this);
    _initializerDefineProperty(this, "emailedAt", _descriptor2, this);
    _initializerDefineProperty(this, "viewedAt", _descriptor3, this);
    _initializerDefineProperty(this, "archivedAt", _descriptor4, this);
    _initializerDefineProperty(this, "createdAt", _descriptor5, this);
    _initializerDefineProperty(this, "event", _descriptor6, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor7, this);
    _initializerDefineProperty(this, "userId", _descriptor8, this);
    _initializerDefineProperty(this, "actor", _descriptor9, this);
    _initializerDefineProperty(this, "actorId", _descriptor10, this);
    _initializerDefineProperty(this, "comment", _descriptor11, this);
    _initializerDefineProperty(this, "commentId", _descriptor12, this);
    _initializerDefineProperty(this, "document", _descriptor13, this);
    _initializerDefineProperty(this, "documentId", _descriptor14, this);
    _initializerDefineProperty(this, "revision", _descriptor15, this);
    _initializerDefineProperty(this, "revisionId", _descriptor16, this);
    _initializerDefineProperty(this, "collection", _descriptor17, this);
    _initializerDefineProperty(this, "collectionId", _descriptor18, this);
    _initializerDefineProperty(this, "team", _descriptor19, this);
    _initializerDefineProperty(this, "teamId", _descriptor20, this);
  }
  static async createEvent(model, options) {
    const params = {
      name: "notifications.create",
      userId: model.userId,
      modelId: model.id,
      teamId: model.teamId,
      commentId: model.commentId,
      documentId: model.documentId,
      collectionId: model.collectionId,
      actorId: model.actorId
    };
    if (options.transaction) {
      options.transaction.afterCommit(() => void _Event.default.schedule(params));
      return;
    }
    await _Event.default.schedule(params);
  }

  /**
   * Returns a token that can be used to mark this notification as read
   * without being logged in.
   *
   * @returns A string token
   */
  get pixelToken() {
    const hash = _crypto.default.createHash("sha256");
    hash.update(`${this.id}-${_env.default.SECRET_KEY}`);
    return hash.digest("hex");
  }

  /**
   * Returns a URL that can be used to mark this notification as read
   * without being logged in.
   *
   * @returns A URL
   */
  get pixelUrl() {
    return `${_env.default.URL}/api/notifications.pixel?token=${this.pixelToken}&id=${this.id}`;
  }

  /**
   * Returns the message id for the email.
   *
   * @param name Username part of the email address.
   * @returns Email message id.
   */
  static emailMessageId(name) {
    baseDomain ||= (0, _domains.getBaseDomain)();
    return `<${name}@${baseDomain}>`;
  }

  /**
   * Returns the message reference id which will be used to setup the thread chain in email clients.
   *
   * @param notification Notification for which to determine the reference id.
   * @returns Reference id as an array.
   */
  static async emailReferences(notification) {
    let name;
    switch (notification.event) {
      case _types.NotificationEventType.PublishDocument:
      case _types.NotificationEventType.UpdateDocument:
        name = `${notification.documentId}-updates`;
        break;
      case _types.NotificationEventType.MentionedInDocument:
      case _types.NotificationEventType.MentionedInComment:
        name = `${notification.documentId}-mentions`;
        break;
      case _types.NotificationEventType.CreateComment:
        {
          const comment = await _Comment.default.findByPk(notification.commentId);
          name = `${comment?.parentCommentId ?? comment?.id}-comments`;
          break;
        }
    }
    return name ? [this.emailMessageId(name)] : undefined;
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec4, _sequelizeTypescript.PrimaryKey, _dec5, _dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "emailedAt", [_sequelizeTypescript.AllowNull, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "viewedAt", [_sequelizeTypescript.AllowNull, _sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "archivedAt", [_sequelizeTypescript.AllowNull, _sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "createdAt", [_sequelizeTypescript.CreatedAt, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "event", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec16, _dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "actor", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "actorId", [_sequelizeTypescript.AllowNull, _dec21, _dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "comment", [_dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "commentId", [_sequelizeTypescript.AllowNull, _dec26, _dec27, _dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec29, _dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_sequelizeTypescript.AllowNull, _dec31, _dec32, _dec33], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "revision", [_dec34, _dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "revisionId", [_sequelizeTypescript.AllowNull, _dec36, _dec37, _dec38], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec39, _dec40], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "collectionId", [_sequelizeTypescript.AllowNull, _dec41, _dec42, _dec43], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec44, _dec45], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec46, _dec47, _dec48], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "createEvent", [_sequelizeTypescript.AfterCreate, _dec49, _dec50], Object.getOwnPropertyDescriptor(_class2, "createEvent"), _class2), _class2)) || _class) || _class) || _class) || _class);
var _default = exports.default = Notification;