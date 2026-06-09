"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _invariant = _interopRequireDefault(require("invariant"));
var _sequelizeTypescript = require("sequelize-typescript");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _AuthenticationProvider = _interopRequireDefault(require("./AuthenticationProvider"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Encrypted = _interopRequireDefault(require("./decorators/Encrypted"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let UserAuthentication = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "user_authentications",
  modelName: "user_authentication"
}), _dec2 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec3 = Reflect.metadata("design:type", Array), _dec4 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec7 = Reflect.metadata("design:type", String), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec10 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec11 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec12 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec13 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec14 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec15 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec16 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec17 = Reflect.metadata("design:type", String), _dec18 = (0, _sequelizeTypescript.BelongsTo)(() => _AuthenticationProvider.default, "authenticationProviderId"), _dec19 = Reflect.metadata("design:type", typeof _AuthenticationProvider.default === "undefined" ? Object : _AuthenticationProvider.default), _dec20 = (0, _sequelizeTypescript.ForeignKey)(() => _AuthenticationProvider.default), _dec21 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec22 = Reflect.metadata("design:type", String), _dec23 = Reflect.metadata("design:type", Function), _dec24 = Reflect.metadata("design:paramtypes", [Object]), _dec(_class = (0, _Fix.default)(_class = (_class2 = class UserAuthentication extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "scopes", _descriptor, this);
    _initializerDefineProperty(this, "accessToken", _descriptor2, this);
    _initializerDefineProperty(this, "refreshToken", _descriptor3, this);
    _initializerDefineProperty(this, "providerId", _descriptor4, this);
    _initializerDefineProperty(this, "expiresAt", _descriptor5, this);
    _initializerDefineProperty(this, "lastValidatedAt", _descriptor6, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor7, this);
    _initializerDefineProperty(this, "userId", _descriptor8, this);
    _initializerDefineProperty(this, "authenticationProvider", _descriptor9, this);
    _initializerDefineProperty(this, "authenticationProviderId", _descriptor10, this);
  }
  static setValidated(model) {
    model.lastValidatedAt = new Date();
  }

  // instance methods

  /**
   * Validates that the tokens within this authentication record are still
   * valid. Will update the record with a new access token if it is expired.
   *
   * @param options SaveOptions
   * @param force Force validation to occur with third party provider
   * @returns true if the accessToken or refreshToken is still valid
   */
  async validateAccess(options) {
    let force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    // Check a maximum of once every 5 minutes
    if (this.lastValidatedAt > (0, _dateFns.subMinutes)(Date.now(), 5) && !force) {
      _Logger.default.debug("authentication", "Recently validated, skipping access token validation");
      return true;
    }
    const authenticationProvider = await this.$get("authenticationProvider", {
      transaction: options.transaction
    });
    (0, _invariant.default)(authenticationProvider, "authenticationProvider must exist for user authentication");
    try {
      await this.refreshAccessTokenIfNeeded(authenticationProvider, options);
      const client = authenticationProvider.oauthClient;
      if (client) {
        await client.userInfo(this.accessToken);
      }

      // write to db when we last checked
      this.lastValidatedAt = new Date();
      await this.save({
        transaction: options.transaction
      });
      return true;
    } catch (error) {
      if (error.id === "authentication_required") {
        return false;
      }

      // Throw unknown errors to trigger a retry of the task.
      throw error;
    }
  }

  /**
   * Updates the accessToken and refreshToken in the database if expiring. If the
   * accessToken is still valid or the AuthenticationProvider does not support
   * refreshTokens then no work is done.
   *
   * @param options SaveOptions
   * @returns true if the tokens were updated
   */
  async refreshAccessTokenIfNeeded(authenticationProvider, options) {
    if (this.expiresAt > (0, _dateFns.addMinutes)(Date.now(), 5)) {
      _Logger.default.debug("authentication", "Existing token is still valid, skipping refresh");
      return false;
    }
    if (!this.refreshToken) {
      _Logger.default.debug("authentication", "No refresh token found, skipping refresh");
      return false;
    }

    // Some providers send no expiry depending on setup, in this case we can't
    // refresh and assume the session is valid until logged out.
    if (!this.expiresAt) {
      _Logger.default.debug("authentication", "No expiry found, skipping refresh");
      return false;
    }
    _Logger.default.info("authentication", "Refreshing expiring access token", {
      id: this.id,
      userId: this.userId
    });
    const client = authenticationProvider.oauthClient;
    if (client) {
      const response = await client.rotateToken(this.accessToken, this.refreshToken);

      // Not all OAuth providers return a new refreshToken so we need to guard
      // against setting to an empty value.
      if (response.refreshToken) {
        this.refreshToken = response.refreshToken;
      }
      this.accessToken = response.accessToken;
      this.expiresAt = response.expiresAt;
      await this.save(options);
    }
    _Logger.default.info("authentication", "Successfully refreshed expired access token", {
      id: this.id,
      userId: this.userId
    });
    return true;
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "scopes", [_dec2, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "accessToken", [_dec4, _Encrypted.default, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "refreshToken", [_dec6, _Encrypted.default, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "providerId", [_sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "expiresAt", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "lastValidatedAt", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec15, _dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "authenticationProvider", [_dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "authenticationProviderId", [_dec20, _sequelizeTypescript.Unique, _dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "setValidated", [_sequelizeTypescript.BeforeCreate, _dec23, _dec24], Object.getOwnPropertyDescriptor(_class2, "setValidated"), _class2), _class2)) || _class) || _class);
var _default = exports.default = UserAuthentication;