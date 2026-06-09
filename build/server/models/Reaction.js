"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _sequelizeTypescript = require("sequelize-typescript");
var _context = require("./../context");
var _Comment = _interopRequireDefault(require("./Comment"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Reaction = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "reactions",
  modelName: "reaction"
}), _dec2 = (0, _Length.default)({
  max: 50,
  msg: `emoji must be 50 characters or less`
}), _dec3 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default), _dec6 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec7 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec9 = Reflect.metadata("design:type", String), _dec10 = (0, _sequelizeTypescript.BelongsTo)(() => _Comment.default), _dec11 = Reflect.metadata("design:type", typeof _Comment.default === "undefined" ? Object : _Comment.default), _dec12 = (0, _sequelizeTypescript.ForeignKey)(() => _Comment.default), _dec13 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec14 = Reflect.metadata("design:type", String), _dec15 = Reflect.metadata("design:type", Function), _dec16 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec17 = Reflect.metadata("design:type", Function), _dec18 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec(_class = (0, _Fix.default)(_class = (_class2 = class Reaction extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "emoji", _descriptor, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor2, this);
    _initializerDefineProperty(this, "userId", _descriptor3, this);
    _initializerDefineProperty(this, "comment", _descriptor4, this);
    _initializerDefineProperty(this, "commentId", _descriptor5, this);
  }
  static async addReactionToCommentCache(model, ctx) {
    const {
      transaction
    } = ctx;
    const lock = transaction ? {
      level: transaction.LOCK.UPDATE,
      of: _Comment.default
    } : undefined;
    const comment = await _Comment.default.findByPk(model.commentId, {
      transaction,
      lock
    });
    if (!comment) {
      return;
    }
    const reactions = (0, _cloneDeep.default)(comment.reactions) ?? [];
    const reaction = reactions.find(r => r.emoji === model.emoji);
    if (!reaction) {
      reactions.push({
        emoji: model.emoji,
        userIds: [model.userId]
      });
    } else {
      reaction.userIds = (0, _uniq.default)([...reaction.userIds, model.userId]);
    }
    comment.reactions = reactions;

    // Pass only the fields needed in APIContext; otherwise sequelize props will be overwritten.
    const context = (0, _context.createContext)({
      user: ctx.auth.user,
      authType: ctx.auth.type,
      ...ctx
    });
    await comment.saveWithCtx(context, {
      fields: ["reactions"],
      silent: true
    }, {
      name: "add_reaction",
      data: {
        emoji: model.emoji
      }
    });
  }
  static async removeReactionFromCommentCache(model, ctx) {
    const {
      transaction
    } = ctx;
    const lock = transaction ? {
      level: transaction.LOCK.UPDATE,
      of: _Comment.default
    } : undefined;
    const comment = await _Comment.default.findByPk(model.commentId, {
      transaction,
      lock
    });
    if (!comment) {
      return;
    }
    let reactions = (0, _cloneDeep.default)(comment.reactions) ?? [];
    const reaction = reactions.find(r => r.emoji === model.emoji);
    if (reaction) {
      reaction.userIds = reaction.userIds.filter(id => id !== model.userId);
      if (reaction.userIds.length === 0) {
        reactions = reactions.filter(r => r.emoji !== model.emoji);
      }
    }
    comment.reactions = reactions;

    // Pass only the fields needed in APIContext; otherwise sequelize props will be overwritten.
    const context = (0, _context.createContext)({
      user: ctx.auth.user,
      authType: ctx.auth.type,
      ...ctx
    });
    await comment.saveWithCtx(context, {
      fields: ["reactions"],
      silent: true
    }, {
      name: "remove_reaction",
      data: {
        emoji: model.emoji
      }
    });
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "emoji", [_dec2, _dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec7, _dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "comment", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "commentId", [_dec12, _dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "addReactionToCommentCache", [_sequelizeTypescript.AfterCreate, _dec15, _dec16], Object.getOwnPropertyDescriptor(_class2, "addReactionToCommentCache"), _class2), _applyDecoratedDescriptor(_class2, "removeReactionFromCommentCache", [_sequelizeTypescript.AfterDestroy, _dec17, _dec18], Object.getOwnPropertyDescriptor(_class2, "removeReactionFromCommentCache"), _class2), _class2)) || _class) || _class);
var _default = exports.default = Reaction;