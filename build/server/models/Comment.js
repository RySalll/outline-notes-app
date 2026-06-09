"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _sequelizeTypescript = require("sequelize-typescript");
var _ProsemirrorHelper = require("./../../shared/utils/ProsemirrorHelper");
var _validations = require("./../../shared/validations");
var _editor = require("./../editor");
var _errors = require("./../errors");
var _Document = _interopRequireDefault(require("./Document"));
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _TextLength = _interopRequireDefault(require("./validators/TextLength"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Comment = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    model: _User.default,
    as: "createdBy",
    paranoid: false
  }, {
    model: _User.default,
    as: "resolvedBy",
    paranoid: false
  }]
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "comments",
  modelName: "comment"
}), _dec3 = (0, _TextLength.default)({
  max: _validations.CommentValidation.maxLength,
  msg: `Comment must be less than ${_validations.CommentValidation.maxLength} characters`
}), _dec4 = (0, _sequelizeTypescript.Length)({
  max: _validations.CommentValidation.maxLength * 10,
  msg: `Comment data is too large`
}), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec6 = Reflect.metadata("design:type", typeof ProsemirrorData === "undefined" ? Object : ProsemirrorData), _dec7 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec8 = Reflect.metadata("design:type", Array), _dec9 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec10 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec11 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec13 = Reflect.metadata("design:type", String), _dec14 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec15 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec16 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "resolvedById"), _dec17 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec18 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec19 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec20 = Reflect.metadata("design:type", String), _dec21 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec22 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec23 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec24 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec25 = Reflect.metadata("design:type", String), _dec26 = (0, _sequelizeTypescript.BelongsTo)(() => Comment, "parentCommentId"), _dec27 = Reflect.metadata("design:type", Object), _dec28 = (0, _sequelizeTypescript.ForeignKey)(() => Comment), _dec29 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec30 = Reflect.metadata("design:type", String), _dec31 = Reflect.metadata("design:type", Function), _dec32 = Reflect.metadata("design:paramtypes", [Object, typeof HookContext === "undefined" ? Object : HookContext]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class Comment extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "data", _descriptor, this);
    _initializerDefineProperty(this, "reactions", _descriptor2, this);
    // associations
    _initializerDefineProperty(this, "createdBy", _descriptor3, this);
    _initializerDefineProperty(this, "createdById", _descriptor4, this);
    _initializerDefineProperty(this, "resolvedAt", _descriptor5, this);
    _initializerDefineProperty(this, "resolvedBy", _descriptor6, this);
    _initializerDefineProperty(this, "resolvedById", _descriptor7, this);
    _initializerDefineProperty(this, "document", _descriptor8, this);
    _initializerDefineProperty(this, "documentId", _descriptor9, this);
    _initializerDefineProperty(this, "parentComment", _descriptor10, this);
    _initializerDefineProperty(this, "parentCommentId", _descriptor11, this);
  }
  // methods

  /**
   * Resolve the comment. Note this does not save the comment to the database.
   *
   * @param resolvedBy The user who resolved the comment
   */
  resolve(resolvedBy) {
    if (this.isResolved) {
      throw (0, _errors.ValidationError)("Comment is already resolved");
    }
    if (this.parentCommentId) {
      throw (0, _errors.ValidationError)("Cannot resolve a reply");
    }
    this.resolvedById = resolvedBy.id;
    this.resolvedBy = resolvedBy;
    this.resolvedAt = new Date();
  }

  /**
   * Unresolve the comment. Note this does not save the comment to the database.
   */
  unresolve() {
    if (!this.isResolved) {
      throw (0, _errors.ValidationError)("Comment is not resolved");
    }
    this.resolvedById = null;
    this.resolvedBy = null;
    this.resolvedAt = null;
  }

  /**
   * Whether the comment is resolved
   */
  get isResolved() {
    return !!this.resolvedAt;
  }

  /**
   * Convert the comment data to plain text
   *
   * @returns The plain text representation of the comment data
   */
  toPlainText() {
    const node = _prosemirrorModel.Node.fromJSON(_editor.schema, this.data);
    return _ProsemirrorHelper.ProsemirrorHelper.toPlainText(node, _editor.schema);
  }

  // hooks

  static async deleteChildComments(model, ctx) {
    const {
      transaction
    } = ctx;
    const lock = transaction ? {
      level: transaction.LOCK.UPDATE,
      of: this
    } : undefined;
    const childComments = await this.findAll({
      where: {
        parentCommentId: model.id
      },
      transaction,
      lock
    });
    await Promise.all(childComments.map(childComment => childComment.destroy({
      transaction
    })));
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "data", [_dec3, _dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "reactions", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec11, _dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "resolvedAt", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "resolvedBy", [_dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "resolvedById", [_dec18, _dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_dec23, _dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "parentComment", [_dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "parentCommentId", [_dec28, _dec29, _dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "deleteChildComments", [_sequelizeTypescript.AfterDestroy, _dec31, _dec32], Object.getOwnPropertyDescriptor(_class2, "deleteChildComments"), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = Comment;