"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _url = require("url");
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _validator = require("validator");
var _constants = require("./../../shared/constants");
var _types = require("./../../shared/types");
var _domains = require("./../../shared/utils/domains");
var _email = require("./../../shared/utils/email");
var _env = _interopRequireDefault(require("./../env"));
var _errors = require("./../errors");
var _DeleteAttachmentTask = _interopRequireDefault(require("./../queues/tasks/DeleteAttachmentTask"));
var _parseAttachmentIds = _interopRequireDefault(require("./../utils/parseAttachmentIds"));
var _Attachment = _interopRequireDefault(require("./Attachment"));
var _AuthenticationProvider = _interopRequireDefault(require("./AuthenticationProvider"));
var _Collection = _interopRequireDefault(require("./Collection"));
var _Document = _interopRequireDefault(require("./Document"));
var _Share = _interopRequireDefault(require("./Share"));
var _TeamDomain = _interopRequireDefault(require("./TeamDomain"));
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _IsFQDN = _interopRequireDefault(require("./validators/IsFQDN"));
var _IsUrlOrRelativePath = _interopRequireDefault(require("./validators/IsUrlOrRelativePath"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _NotContainsUrl = _interopRequireDefault(require("./validators/NotContainsUrl"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _init, _Team;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Team = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withDomains: {
    include: [{
      model: _TeamDomain.default
    }]
  },
  withAuthenticationProviders: {
    include: [{
      model: _AuthenticationProvider.default,
      as: "authenticationProviders"
    }]
  }
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "teams",
  modelName: "team"
}), _dec3 = (0, _Length.default)({
  min: 1,
  max: 255,
  msg: "name must be between 1 to 255 characters"
}), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _Length.default)({
  min: 2,
  max: _env.default.isCloudHosted ? 32 : 255,
  msg: `subdomain must be between 2 and ${_env.default.isCloudHosted ? 32 : 255} characters`
}), _dec6 = (0, _sequelizeTypescript.Is)({
  args: [/^[a-z\d-]+$/, "i"],
  msg: "Must be only alphanumeric and dashes"
}), _dec7 = (0, _sequelizeTypescript.NotIn)({
  args: [_domains.RESERVED_SUBDOMAINS],
  msg: "You chose a restricted word, please try another."
}), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _Length.default)({
  max: 255,
  msg: "domain must be 255 characters or less"
}), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _sequelizeTypescript.IsUUID)(4), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec13 = Reflect.metadata("design:type", String), _dec14 = (0, _Length.default)({
  max: 4096,
  msg: "avatarUrl must be 4096 characters or less"
}), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec16 = Reflect.metadata("design:type", Function), _dec17 = Reflect.metadata("design:paramtypes", []), _dec18 = (0, _sequelizeTypescript.Default)(true), _dec19 = Reflect.metadata("design:type", Boolean), _dec20 = (0, _sequelizeTypescript.Default)(false), _dec21 = Reflect.metadata("design:type", Boolean), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec23 = Reflect.metadata("design:type", Object), _dec24 = (0, _sequelizeTypescript.Default)(true), _dec25 = Reflect.metadata("design:type", Boolean), _dec26 = (0, _sequelizeTypescript.Default)(true), _dec27 = Reflect.metadata("design:type", Boolean), _dec28 = (0, _sequelizeTypescript.Default)(true), _dec29 = Reflect.metadata("design:type", Boolean), _dec30 = (0, _sequelizeTypescript.Default)(true), _dec31 = Reflect.metadata("design:type", Boolean), _dec32 = (0, _sequelizeTypescript.Default)(_types.UserRole.Member), _dec33 = (0, _sequelizeTypescript.IsIn)([[_types.UserRole.Viewer, _types.UserRole.Member]]), _dec34 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec35 = Reflect.metadata("design:type", typeof _types.UserRole === "undefined" ? Object : _types.UserRole), _dec36 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BIGINT), _dec37 = Reflect.metadata("design:type", Number), _dec38 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec39 = Reflect.metadata("design:type", typeof _types.TeamPreferences === "undefined" ? Object : _types.TeamPreferences), _dec40 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec41 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec42 = (0, _sequelizeTypescript.HasMany)(() => _Collection.default), _dec43 = Reflect.metadata("design:type", Array), _dec44 = (0, _sequelizeTypescript.HasMany)(() => _Document.default), _dec45 = Reflect.metadata("design:type", Array), _dec46 = (0, _sequelizeTypescript.HasMany)(() => _User.default), _dec47 = Reflect.metadata("design:type", Array), _dec48 = (0, _sequelizeTypescript.HasMany)(() => _AuthenticationProvider.default), _dec49 = Reflect.metadata("design:type", Array), _dec50 = (0, _sequelizeTypescript.HasMany)(() => _TeamDomain.default), _dec51 = Reflect.metadata("design:type", Array), _dec52 = Reflect.metadata("design:type", Function), _dec53 = Reflect.metadata("design:paramtypes", [Object]), _dec54 = Reflect.metadata("design:type", Function), _dec55 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = (_Team = class Team extends _ParanoidModel.default {
  constructor() {
    var _this;
    super(...arguments);
    _this = this;
    _initializerDefineProperty(this, "name", _descriptor, this);
    _initializerDefineProperty(this, "subdomain", _descriptor2, this);
    _initializerDefineProperty(this, "domain", _descriptor3, this);
    _initializerDefineProperty(this, "defaultCollectionId", _descriptor4, this);
    _initializerDefineProperty(this, "sharing", _descriptor5, this);
    _initializerDefineProperty(this, "inviteRequired", _descriptor6, this);
    _initializerDefineProperty(this, "signupQueryParams", _descriptor7, this);
    _initializerDefineProperty(this, "guestSignin", _descriptor8, this);
    _initializerDefineProperty(this, "documentEmbeds", _descriptor9, this);
    _initializerDefineProperty(this, "memberCollectionCreate", _descriptor10, this);
    _initializerDefineProperty(this, "memberTeamCreate", _descriptor11, this);
    _initializerDefineProperty(this, "defaultUserRole", _descriptor12, this);
    /** Approximate size in bytes of all attachments in the team. */
    _initializerDefineProperty(this, "approximateTotalAttachmentsSize", _descriptor13, this);
    _initializerDefineProperty(this, "preferences", _descriptor14, this);
    _initializerDefineProperty(this, "suspendedAt", _descriptor15, this);
    _initializerDefineProperty(this, "lastActiveAt", _descriptor16, this);
    /**
     * Preferences that decide behavior for the team.
     *
     * @param preference The team preference to set
     * @param value Sets the preference value
     * @returns The current team preferences
     */
    _defineProperty(this, "setPreference", (preference, value) => {
      if (!this.preferences) {
        this.preferences = {};
      }
      this.preferences = {
        ...this.preferences,
        [preference]: value
      };
      return this.preferences;
    });
    /**
     * Returns the value of the given preference.
     *
     * @param preference The team preference to retrieve
     * @returns The preference value if set, else the default value
     */
    _defineProperty(this, "getPreference", preference => this.preferences?.[preference] ?? _constants.TeamPreferenceDefaults[preference] ?? false);
    /**
     * Updates the lastActiveAt timestamp to the current time.
     *
     * @param force Whether to force the update even if the last update was recent
     * @returns A promise that resolves with the updated team
     */
    _defineProperty(this, "updateActiveAt", async function () {
      let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      const fiveMinutesAgo = (0, _dateFns.subMinutes)(new Date(), 5);

      // ensure this is updated only every few minutes otherwise
      // we'll be constantly writing to the DB as API requests happen
      if (!_this.lastActiveAt || _this.lastActiveAt < fiveMinutesAgo || force) {
        _this.lastActiveAt = new Date();
      }

      // Save only writes to the database if there are changes
      return _this.save({
        hooks: false
      });
    });
    _defineProperty(this, "collectionIds", async function () {
      let paranoid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      const models = await _Collection.default.findAll({
        attributes: ["id"],
        where: {
          teamId: this.id,
          permission: {
            [_sequelize.Op.ne]: null
          }
        },
        paranoid
      });
      return models.map(c => c.id);
    });
    /**
     * Find whether the passed domain can be used to sign-in to this team. Note
     * that this method always returns true if no domain restrictions are set.
     *
     * @param domainOrEmail The domain or email to check
     * @returns True if the domain is allowed to sign-in to this team
     */
    _defineProperty(this, "isDomainAllowed", async function (domainOrEmail) {
      const allowedDomains = (await this.$get("allowedDomains")) || [];
      let domain = domainOrEmail;
      if ((0, _validator.isEmail)(domainOrEmail)) {
        const parsed = (0, _email.parseEmail)(domainOrEmail);
        domain = parsed.domain;
      }
      return allowedDomains.length === 0 || allowedDomains.map(d => d.name).includes(domain);
    });
    // associations
    _initializerDefineProperty(this, "collections", _descriptor17, this);
    _initializerDefineProperty(this, "documents", _descriptor18, this);
    _initializerDefineProperty(this, "users", _descriptor19, this);
    _initializerDefineProperty(this, "authenticationProviders", _descriptor20, this);
    _initializerDefineProperty(this, "allowedDomains", _descriptor21, this);
  }
  get avatarUrl() {
    const original = this.getDataValue("avatarUrl");
    if (original && !original.startsWith("https://tiley.herokuapp.com")) {
      return original;
    }
    return null;
  }
  set avatarUrl(value) {
    this.setDataValue("avatarUrl", value);
  }
  // getters

  /**
   * Returns whether the team has been suspended and is no longer accessible.
   */
  get isSuspended() {
    return !!this.suspendedAt;
  }

  /**
   * Returns whether the team has email login enabled. For self-hosted installs
   * this also considers whether SMTP connection details have been configured.
   *
   * @return {boolean} Whether to show email login options
   */
  get emailSigninEnabled() {
    return this.guestSignin && (!!_env.default.SMTP_HOST || _env.default.isDevelopment);
  }
  get url() {
    const url = new _url.URL(_env.default.URL);

    // custom domain
    if (this.domain) {
      return `${url.protocol}//${this.domain}${url.port ? `:${url.port}` : ""}`;
    }
    if (!this.subdomain || !_env.default.isCloudHosted) {
      return _env.default.URL;
    }
    url.host = `${this.subdomain}.${(0, _domains.getBaseDomain)()}`;
    return url.href.replace(/\/$/, "");
  }

  /**
   * Returns a code that can be used to delete the user's team. The code will
   * be rotated when the user signs out.
   *
   * @returns The deletion code.
   */
  getDeleteConfirmationCode(user) {
    return _crypto.default.createHash("md5").update(`${this.id}${user.jwtSecret}`).digest("hex").replace(/[l1IoO0]/gi, "").slice(0, 8).toUpperCase();
  }
  // hooks

  static async setPreferences(model) {
    // Set here rather than in TeamPreferenceDefaults as we only want to enable by default for new
    // workspaces.
    model.setPreference(_types.TeamPreference.MembersCanInvite, true);

    // Set last active at on creation.
    model.lastActiveAt = new Date();
    return model;
  }
  static async checkDomain(model, options) {
    if (!model.domain) {
      return model;
    }
    model.domain = model.domain.toLowerCase();
    const count = await _Share.default.count({
      ...options,
      where: {
        domain: model.domain
      }
    });
    if (count > 0) {
      throw (0, _errors.ValidationError)("Domain is already in use");
    }
    return model;
  }
}, _defineProperty(_Team, "deletePreviousAvatar", async model => {
  const previousAvatarUrl = model.previous("avatarUrl");
  if (previousAvatarUrl && previousAvatarUrl !== model.avatarUrl) {
    const attachmentIds = (0, _parseAttachmentIds.default)(previousAvatarUrl, true);
    if (!attachmentIds.length) {
      return;
    }
    const attachment = await _Attachment.default.findOne({
      where: {
        id: attachmentIds[0],
        teamId: model.id
      }
    });
    if (attachment) {
      await _DeleteAttachmentTask.default.schedule({
        attachmentId: attachment.id,
        teamId: model.id
      });
    }
  }
}), _Team), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_NotContainsUrl.default, _dec3, _sequelizeTypescript.Column, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "subdomain", [_sequelizeTypescript.IsLowercase, _sequelizeTypescript.Unique, _dec5, _dec6, _dec7, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "domain", [_sequelizeTypescript.Unique, _dec9, _IsFQDN.default, _sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "defaultCollectionId", [_dec11, _dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2.prototype, "avatarUrl", [_sequelizeTypescript.AllowNull, _IsUrlOrRelativePath.default, _dec14, _dec15, _dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "avatarUrl"), _class2.prototype), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "sharing", [_dec18, _sequelizeTypescript.Column, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "inviteRequired", [_dec20, _sequelizeTypescript.Column, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "signupQueryParams", [_dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "guestSignin", [_dec24, _sequelizeTypescript.Column, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "documentEmbeds", [_dec26, _sequelizeTypescript.Column, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "memberCollectionCreate", [_dec28, _sequelizeTypescript.Column, _dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "memberTeamCreate", [_dec30, _sequelizeTypescript.Column, _dec31], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "defaultUserRole", [_dec32, _dec33, _dec34, _dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "approximateTotalAttachmentsSize", [_sequelizeTypescript.IsNumeric, _dec36, _dec37], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "preferences", [_sequelizeTypescript.AllowNull, _dec38, _dec39], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "suspendedAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec40], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "lastActiveAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec41], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "collections", [_dec42, _dec43], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "documents", [_dec44, _dec45], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "users", [_dec46, _dec47], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "authenticationProviders", [_dec48, _dec49], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "allowedDomains", [_dec50, _dec51], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "setPreferences", [_sequelizeTypescript.BeforeCreate, _dec52, _dec53], Object.getOwnPropertyDescriptor(_class2, "setPreferences"), _class2), _applyDecoratedDescriptor(_class2, "checkDomain", [_sequelizeTypescript.BeforeUpdate, _dec54, _dec55], Object.getOwnPropertyDescriptor(_class2, "checkDomain"), _class2), _applyDecoratedDescriptor(_class2, "deletePreviousAvatar", [_sequelizeTypescript.AfterUpdate], (_init = Object.getOwnPropertyDescriptor(_class2, "deletePreviousAvatar"), _init = _init ? _init.value : undefined, {
  enumerable: true,
  configurable: true,
  writable: true,
  initializer: function () {
    return _init;
  }
}), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = Team;