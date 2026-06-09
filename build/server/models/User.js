"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UserFlag = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _dateFns = require("date-fns");
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _constants = require("./../../shared/constants");
var _i18n = require("./../../shared/i18n");
var _types = require("./../../shared/types");
var _UserRoleHelper = require("./../../shared/utils/UserRoleHelper");
var _color = require("./../../shared/utils/color");
var _env = _interopRequireDefault(require("./../env"));
var _DeleteAttachmentTask = _interopRequireDefault(require("./../queues/tasks/DeleteAttachmentTask"));
var _parseAttachmentIds = _interopRequireDefault(require("./../utils/parseAttachmentIds"));
var _errors = require("../errors");
var _Attachment = _interopRequireDefault(require("./Attachment"));
var _AuthenticationProvider = _interopRequireDefault(require("./AuthenticationProvider"));
var _Collection = _interopRequireDefault(require("./Collection"));
var _Group = _interopRequireDefault(require("./Group"));
var _Team = _interopRequireDefault(require("./Team"));
var _UserAuthentication = _interopRequireDefault(require("./UserAuthentication"));
var _UserMembership = _interopRequireDefault(require("./UserMembership"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Encrypted = _interopRequireDefault(require("./decorators/Encrypted"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _IsUrlOrRelativePath = _interopRequireDefault(require("./validators/IsUrlOrRelativePath"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _NotContainsUrl = _interopRequireDefault(require("./validators/NotContainsUrl"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _init, _init2, _init3, _User;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
/**
 * Flags that are available for setting on the user.
 */
let UserFlag = exports.UserFlag = /*#__PURE__*/function (UserFlag) {
  UserFlag["InviteSent"] = "inviteSent";
  UserFlag["InviteReminderSent"] = "inviteReminderSent";
  UserFlag["Desktop"] = "desktop";
  UserFlag["DesktopWeb"] = "desktopWeb";
  UserFlag["MobileWeb"] = "mobileWeb";
  return UserFlag;
}({});
let User = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withAuthentications: {
    include: [{
      separate: true,
      model: _UserAuthentication.default,
      as: "authentications",
      include: [{
        model: _AuthenticationProvider.default,
        as: "authenticationProvider",
        where: {
          enabled: true
        }
      }]
    }]
  },
  withTeam: {
    include: [{
      model: _Team.default,
      as: "team",
      required: true
    }]
  },
  withInvitedBy: {
    include: [{
      model: User,
      as: "invitedBy",
      required: true
    }]
  },
  invited: {
    where: {
      lastActiveAt: {
        [_sequelize.Op.is]: null
      }
    }
  }
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "users",
  modelName: "user"
}), _dec3 = (0, _Length.default)({
  max: 255,
  msg: "User email must be 255 characters or less"
}), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _Length.default)({
  max: 255,
  msg: "User name must be 255 characters or less"
}), _dec6 = Reflect.metadata("design:type", String), _dec7 = (0, _sequelizeTypescript.Default)(_types.UserRole.Member), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ENUM(...Object.values(_types.UserRole))), _dec9 = Reflect.metadata("design:type", typeof _types.UserRole === "undefined" ? Object : _types.UserRole), _dec10 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec11 = Reflect.metadata("design:type", String), _dec12 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec13 = Reflect.metadata("design:type", String), _dec14 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec15 = Reflect.metadata("design:type", String), _dec16 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec17 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec18 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec19 = Reflect.metadata("design:type", Object), _dec20 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec21 = Reflect.metadata("design:type", typeof _types.UserPreferences === "undefined" ? Object : _types.UserPreferences), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec23 = Reflect.metadata("design:type", typeof NotificationSettings === "undefined" ? Object : NotificationSettings), _dec24 = (0, _sequelizeTypescript.Default)(_env.default.DEFAULT_LANGUAGE), _dec25 = (0, _sequelizeTypescript.IsIn)([_i18n.languages]), _dec26 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec27 = Reflect.metadata("design:type", Object), _dec28 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec29 = Reflect.metadata("design:type", String), _dec30 = (0, _Length.default)({
  max: 4096,
  msg: "avatarUrl must be less than 4096 characters"
}), _dec31 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec32 = Reflect.metadata("design:type", Function), _dec33 = Reflect.metadata("design:paramtypes", []), _dec34 = (0, _sequelizeTypescript.BelongsTo)(() => User, "suspendedById"), _dec35 = Reflect.metadata("design:type", Object), _dec36 = (0, _sequelizeTypescript.ForeignKey)(() => User), _dec37 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec38 = Reflect.metadata("design:type", String), _dec39 = (0, _sequelizeTypescript.BelongsTo)(() => User, "invitedById"), _dec40 = Reflect.metadata("design:type", Object), _dec41 = (0, _sequelizeTypescript.ForeignKey)(() => User), _dec42 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec43 = Reflect.metadata("design:type", String), _dec44 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default), _dec45 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec46 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec47 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec48 = Reflect.metadata("design:type", String), _dec49 = (0, _sequelizeTypescript.HasMany)(() => _UserAuthentication.default), _dec50 = Reflect.metadata("design:type", Array), _dec51 = Reflect.metadata("design:type", Function), _dec52 = Reflect.metadata("design:paramtypes", [Object, typeof InstanceUpdateOptions === "undefined" ? Object : InstanceUpdateOptions]), _dec53 = Reflect.metadata("design:type", Function), _dec54 = Reflect.metadata("design:paramtypes", [Object, typeof InstanceUpdateOptions === "undefined" ? Object : InstanceUpdateOptions]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = (_User = class User extends _ParanoidModel.default {
  constructor() {
    var _this;
    super(...arguments);
    _this = this;
    _initializerDefineProperty(this, "email", _descriptor, this);
    _initializerDefineProperty(this, "name", _descriptor2, this);
    _initializerDefineProperty(this, "role", _descriptor3, this);
    _initializerDefineProperty(this, "jwtSecret", _descriptor4, this);
    _initializerDefineProperty(this, "lastActiveAt", _descriptor5, this);
    _initializerDefineProperty(this, "lastActiveIp", _descriptor6, this);
    _initializerDefineProperty(this, "lastSignedInAt", _descriptor7, this);
    _initializerDefineProperty(this, "lastSignedInIp", _descriptor8, this);
    _initializerDefineProperty(this, "lastSigninEmailSentAt", _descriptor9, this);
    _initializerDefineProperty(this, "suspendedAt", _descriptor10, this);
    _initializerDefineProperty(this, "flags", _descriptor11, this);
    _initializerDefineProperty(this, "preferences", _descriptor12, this);
    _initializerDefineProperty(this, "notificationSettings", _descriptor13, this);
    _initializerDefineProperty(this, "language", _descriptor14, this);
    _initializerDefineProperty(this, "timezone", _descriptor15, this);
    // associations
    _initializerDefineProperty(this, "suspendedBy", _descriptor16, this);
    _initializerDefineProperty(this, "suspendedById", _descriptor17, this);
    _initializerDefineProperty(this, "invitedBy", _descriptor18, this);
    _initializerDefineProperty(this, "invitedById", _descriptor19, this);
    _initializerDefineProperty(this, "team", _descriptor20, this);
    _initializerDefineProperty(this, "teamId", _descriptor21, this);
    _initializerDefineProperty(this, "authentications", _descriptor22, this);
    // instance methods
    /**
     * Sets a preference for the users notification settings.
     *
     * @param type The type of notification event
     * @param value Set the preference to true/false
     */
    _defineProperty(this, "setNotificationEventType", function (type) {
      let value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      _this.notificationSettings = {
        ..._this.notificationSettings,
        [type]: value
      };
    });
    /**
     * Returns the current preference for the given notification event type taking
     * into account the default system value.
     *
     * @param type The type of notification event
     * @returns The current preference
     */
    _defineProperty(this, "subscribedToEventType", type => this.notificationSettings[type] ?? _types.NotificationEventDefaults[type] ?? false);
    /**
     * User flags are for storing information on a user record that is not visible
     * to the user itself.
     *
     * @param flag The flag to set
     * @param value Set the flag to true/false
     * @returns The current user flags
     */
    _defineProperty(this, "setFlag", function (flag) {
      let value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (!_this.flags) {
        _this.flags = {};
      }
      const binary = value ? 1 : 0;
      if (_this.flags[flag] !== binary) {
        _this.flags = {
          ..._this.flags,
          [flag]: binary
        };
      }
      return _this.flags;
    });
    /**
     * Returns the content of the given user flag.
     *
     * @param flag The flag to retrieve
     * @returns The flag value
     */
    _defineProperty(this, "getFlag", flag => this.flags?.[flag] ?? 0);
    /**
     * User flags are for storing information on a user record that is not visible
     * to the user itself.
     *
     * @param flag The flag to set
     * @param value The amount to increment by, defaults to 1
     * @returns The current user flags
     */
    _defineProperty(this, "incrementFlag", function (flag) {
      let value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      if (!_this.flags) {
        _this.flags = {};
      }
      _this.flags = {
        ..._this.flags,
        [flag]: (_this.flags[flag] ?? 0) + value
      };
      return _this.flags;
    });
    /**
     * Preferences set by the user that decide application behavior and ui.
     *
     * @param preference The user preference to set
     * @param value Sets the preference value
     * @returns The current user preferences
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
     * Returns the value of the givem preference
     *
     * @param preference The user preference to retrieve
     * @returns The preference value if set, else the default value.
     */
    _defineProperty(this, "getPreference", preference => this.preferences?.[preference] ?? _constants.UserPreferenceDefaults[preference] ?? false);
    /**
     * Returns the user's active groups.
     *
     * @param options Additional options to pass to the find
     * @returns An array of groups
     */
    _defineProperty(this, "groups", function () {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _Group.default.scope({
        method: ["withMembership", _this.id]
      }).findAll({
        where: {
          teamId: _this.teamId
        },
        ...options
      });
    });
    /**
     * Returns the user's active group ids.
     *
     * @param options Additional options to pass to the find
     * @returns An array of group ids
     */
    _defineProperty(this, "groupIds", async function () {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return (await _this.groups(options)).map(g => g.id);
    });
    /**
     * Returns the user's active collection ids. This includes collections the user
     * has access to through group memberships.
     *
     * @param options Additional options to pass to the find
     * @returns An array of collection ids
     */
    _defineProperty(this, "collectionIds", async function () {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      const collectionStubs = await _Collection.default.scope({
        method: ["withMembership", _this.id]
      }).findAll({
        attributes: ["id", "permission"],
        where: {
          teamId: _this.teamId
        },
        paranoid: true,
        ...options
      });
      return collectionStubs.filter(c => Object.values(_types.CollectionPermission).includes(c.permission) && !_this.isGuest || c.memberships.length > 0 || c.groupMemberships.length > 0).map(c => c.id);
    });
    _defineProperty(this, "updateActiveAt", async function (ctx) {
      let force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      const {
        ip
      } = ctx.request;
      const fiveMinutesAgo = (0, _dateFns.subMinutes)(new Date(), 5);

      // ensure this is updated only every few minutes otherwise
      // we'll be constantly writing to the DB as API requests happen
      if (!_this.lastActiveAt || _this.lastActiveAt < fiveMinutesAgo || force) {
        _this.lastActiveAt = new Date();
        _this.lastActiveIp = ip;
      }

      // Track the clients each user is using
      if (ctx.userAgent?.source.includes("Outline/")) {
        _this.setFlag(UserFlag.Desktop);
      } else if (ctx.userAgent?.isDesktop) {
        _this.setFlag(UserFlag.DesktopWeb);
      } else if (ctx.userAgent?.isMobile) {
        _this.setFlag(UserFlag.MobileWeb);
      }

      // Save only writes to the database if there are changes
      return _this.save({
        hooks: false
      });
    });
    _defineProperty(this, "updateSignedIn", ip => {
      const now = new Date();
      this.lastActiveAt = now;
      this.lastActiveIp = ip;
      this.lastSignedInAt = now;
      this.lastSignedInIp = ip;
      return this.save({
        hooks: false
      });
    });
    /**
     * Rotate's the users JWT secret. This has the effect of invalidating ALL
     * previously issued tokens.
     *
     * @param options Save options
     * @returns Promise that resolves when database persisted
     */
    _defineProperty(this, "rotateJwtSecret", options => {
      User.setRandomJwtSecret(this);
      return this.save(options);
    });
    /**
     * Returns a session token that is used to make API requests and is stored
     * in the client browser cookies to remain logged in.
     *
     * @param expiresAt The time the token will expire at
     * @returns The session token
     */
    _defineProperty(this, "getJwtToken", expiresAt => _jsonwebtoken.default.sign({
      id: this.id,
      expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
      type: "session"
    }, this.jwtSecret));
    /**
     * Returns a session token that is used to make collaboration requests and is
     * stored in the client memory.
     *
     * @returns The session token
     */
    _defineProperty(this, "getCollaborationToken", () => _jsonwebtoken.default.sign({
      id: this.id,
      expiresAt: (0, _dateFns.addHours)(new Date(), 24).toISOString(),
      type: "collaboration"
    }, this.jwtSecret));
    /**
     * Returns a temporary token that is only used for transferring a session
     * between subdomains or domains. It has a short expiry and can only be used
     * once.
     *
     * @returns The transfer token
     */
    _defineProperty(this, "getTransferToken", () => _jsonwebtoken.default.sign({
      id: this.id,
      createdAt: new Date().toISOString(),
      expiresAt: (0, _dateFns.addMinutes)(new Date(), 1).toISOString(),
      type: "transfer"
    }, this.jwtSecret));
    /**
     * Returns a temporary token that is only used for logging in from an email
     * It can only be used to sign in once and has a medium length expiry
     *
     * @returns The email signin token
     */
    _defineProperty(this, "getEmailSigninToken", () => _jsonwebtoken.default.sign({
      id: this.id,
      createdAt: new Date().toISOString(),
      type: "email-signin"
    }, this.jwtSecret));
    /**
     * Returns a temporary token that can be used to update the users
     * email address.
     *
     * @param email The new email address
     * @returns The token
     */
    _defineProperty(this, "getEmailUpdateToken", email => _jsonwebtoken.default.sign({
      id: this.id,
      createdAt: new Date().toISOString(),
      email,
      type: "email-update"
    }, this.jwtSecret));
    /**
     * Returns a list of teams that have a user matching this user's email.
     *
     * @returns A promise resolving to a list of teams
     */
    _defineProperty(this, "availableTeams", async () => _Team.default.findAll({
      include: [{
        model: this.constructor,
        required: true,
        where: {
          email: this.email
        }
      }]
    }));
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

  get isSuspended() {
    return !!this.suspendedAt || !!this.team?.isSuspended;
  }

  /**
   * Whether the user has been invited but not yet signed in.
   */
  get isInvited() {
    return !this.lastActiveAt;
  }

  /**
   * Whether the user is an admin.
   */
  get isAdmin() {
    return this.role === _types.UserRole.Admin;
  }

  /**
   * Whether the user is a member (editor).
   */
  get isMember() {
    return this.role === _types.UserRole.Member;
  }

  /**
   * Whether the user is a viewer.
   */
  get isViewer() {
    return this.role === _types.UserRole.Viewer;
  }

  /**
   * Whether the user is a guest.
   */
  get isGuest() {
    return this.role === _types.UserRole.Guest;
  }
  get color() {
    return (0, _color.stringToColor)(this.id);
  }
  get defaultCollectionPermission() {
    return this.isViewer ? _types.CollectionPermission.Read : _types.CollectionPermission.ReadWrite;
  }
  get defaultDocumentPermission() {
    return this.isViewer ? _types.DocumentPermission.Read : _types.DocumentPermission.ReadWrite;
  }

  /**
   * Returns a code that can be used to delete this user account. The code will
   * be rotated when the user signs out.
   *
   * @returns The deletion code.
   */
  get deleteConfirmationCode() {
    return _crypto.default.createHash("md5").update(this.jwtSecret).digest("hex").replace(/[l1IoO0]/gi, "").slice(0, 8).toUpperCase();
  }
  static async checkRoleChange(model, options) {
    const previousRole = model.previous("role");
    if (model.changed("role") && previousRole === _types.UserRole.Admin && _UserRoleHelper.UserRoleHelper.isRoleLower(model.role, _types.UserRole.Admin)) {
      const {
        count
      } = await this.findAndCountAll({
        where: {
          teamId: model.teamId,
          role: _types.UserRole.Admin,
          id: {
            [_sequelize.Op.ne]: model.id
          }
        },
        limit: 1,
        transaction: options.transaction
      });
      if (count === 0) {
        throw (0, _errors.ValidationError)("At least one admin is required");
      }
    }
  }
  static async updateMembershipPermissions(model, options) {
    const previousRole = model.previous("role");
    if (previousRole && model.changed("role") && _UserRoleHelper.UserRoleHelper.isRoleLower(model.role, _types.UserRole.Member) && _UserRoleHelper.UserRoleHelper.isRoleHigher(previousRole, _types.UserRole.Viewer)) {
      await _UserMembership.default.update({
        permission: _types.CollectionPermission.Read
      }, {
        transaction: options.transaction,
        where: {
          userId: model.id
        }
      });
    }
  }
}, _defineProperty(_User, "removeIdentifyingInfo", async (model, options) => {
  model.email = null;
  model.name = "Unknown";
  model.avatarUrl = null;
  model.lastActiveIp = null;
  model.lastSignedInIp = null;

  // this shouldn't be needed once this issue is resolved:
  // https://github.com/sequelize/sequelize/issues/9318
  await model.save({
    hooks: false,
    transaction: options.transaction
  });
}), _defineProperty(_User, "setRandomJwtSecret", model => {
  model.jwtSecret = _crypto.default.randomBytes(64).toString("hex");
}), _defineProperty(_User, "deletePreviousAvatar", async model => {
  const previousAvatarUrl = model.previous("avatarUrl");
  if (previousAvatarUrl && previousAvatarUrl !== model.avatarUrl) {
    const attachmentIds = (0, _parseAttachmentIds.default)(previousAvatarUrl, true);
    if (!attachmentIds.length) {
      return;
    }
    const attachment = await _Attachment.default.findOne({
      where: {
        id: attachmentIds[0],
        teamId: model.teamId,
        userId: model.id
      }
    });
    if (attachment) {
      await _DeleteAttachmentTask.default.schedule({
        attachmentId: attachment.id,
        teamId: model.teamId
      });
    }
  }
}), _defineProperty(_User, "findByEmail", async function (ctx, email) {
  return this.findOne({
    where: {
      teamId: ctx.context.auth.user.teamId,
      email: email.trim().toLowerCase()
    },
    ...ctx.context
  });
}), _defineProperty(_User, "getCounts", async function (teamId) {
  const countSql = `
      SELECT
        COUNT(CASE WHEN "suspendedAt" IS NOT NULL THEN 1 END) as "suspendedCount",
        COUNT(CASE WHEN "role" = :roleAdmin THEN 1 END) as "adminCount",
        COUNT(CASE WHEN "role" = :roleViewer THEN 1 END) as "viewerCount",
        COUNT(CASE WHEN "lastActiveAt" IS NULL THEN 1 END) as "invitedCount",
        COUNT(CASE WHEN "suspendedAt" IS NULL AND "lastActiveAt" IS NOT NULL THEN 1 END) as "activeCount",
        COUNT(*) as count
      FROM users
      WHERE "deletedAt" IS NULL
      AND "teamId" = :teamId
    `;
  const [results] = await this.sequelize.query(countSql, {
    type: _sequelize.QueryTypes.SELECT,
    replacements: {
      teamId,
      roleAdmin: _types.UserRole.Admin,
      roleViewer: _types.UserRole.Viewer
    }
  });
  const counts = results;
  return {
    active: parseInt(counts.activeCount),
    admins: parseInt(counts.adminCount),
    viewers: parseInt(counts.viewerCount),
    all: parseInt(counts.count),
    invited: parseInt(counts.invitedCount),
    suspended: parseInt(counts.suspendedCount)
  };
}), _User), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "email", [_sequelizeTypescript.IsEmail, _dec3, _sequelizeTypescript.Column, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_NotContainsUrl.default, _dec5, _sequelizeTypescript.Column, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "role", [_dec7, _dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "jwtSecret", [_dec10, _Encrypted.default, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "lastActiveAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "lastActiveIp", [_sequelizeTypescript.IsIP, _sequelizeTypescript.Column, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "lastSignedInAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "lastSignedInIp", [_sequelizeTypescript.IsIP, _sequelizeTypescript.Column, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "lastSigninEmailSentAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "suspendedAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "flags", [_dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "preferences", [_sequelizeTypescript.AllowNull, _dec20, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "notificationSettings", [_dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "language", [_dec24, _dec25, _dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "timezone", [_sequelizeTypescript.AllowNull, _dec28, _dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2.prototype, "avatarUrl", [_sequelizeTypescript.AllowNull, _IsUrlOrRelativePath.default, _dec30, _dec31, _dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "avatarUrl"), _class2.prototype), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "suspendedBy", [_dec34, _dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "suspendedById", [_dec36, _dec37, _dec38], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "invitedBy", [_dec39, _dec40], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "invitedById", [_dec41, _dec42, _dec43], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec44, _dec45], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec46, _dec47, _dec48], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "authentications", [_dec49, _dec50], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "removeIdentifyingInfo", [_sequelizeTypescript.BeforeDestroy], (_init = Object.getOwnPropertyDescriptor(_class2, "removeIdentifyingInfo"), _init = _init ? _init.value : undefined, {
  enumerable: true,
  configurable: true,
  writable: true,
  initializer: function () {
    return _init;
  }
}), _class2), _applyDecoratedDescriptor(_class2, "setRandomJwtSecret", [_sequelizeTypescript.BeforeCreate], (_init2 = Object.getOwnPropertyDescriptor(_class2, "setRandomJwtSecret"), _init2 = _init2 ? _init2.value : undefined, {
  enumerable: true,
  configurable: true,
  writable: true,
  initializer: function () {
    return _init2;
  }
}), _class2), _applyDecoratedDescriptor(_class2, "checkRoleChange", [_sequelizeTypescript.BeforeUpdate, _dec51, _dec52], Object.getOwnPropertyDescriptor(_class2, "checkRoleChange"), _class2), _applyDecoratedDescriptor(_class2, "updateMembershipPermissions", [_sequelizeTypescript.AfterUpdate, _dec53, _dec54], Object.getOwnPropertyDescriptor(_class2, "updateMembershipPermissions"), _class2), _applyDecoratedDescriptor(_class2, "deletePreviousAvatar", [_sequelizeTypescript.AfterUpdate], (_init3 = Object.getOwnPropertyDescriptor(_class2, "deletePreviousAvatar"), _init3 = _init3 ? _init3.value : undefined, {
  enumerable: true,
  configurable: true,
  writable: true,
  initializer: function () {
    return _init3;
  }
}), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = User;