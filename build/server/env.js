"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Environment = void 0;
var _environment = _interopRequireDefault(require("./utils/environment"));
var _os = _interopRequireDefault(require("os"));
var _classValidator = require("class-validator");
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _i18n = require("./../shared/i18n");
var _validators = require("./utils/validators");
var _Deprecated = _interopRequireDefault(require("./models/decorators/Deprecated"));
var _args = require("./utils/args");
var _Public = require("./utils/decorators/Public");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _dec56, _dec57, _dec58, _dec59, _dec60, _dec61, _dec62, _dec63, _dec64, _dec65, _dec66, _dec67, _dec68, _dec69, _dec70, _dec71, _dec72, _dec73, _dec74, _dec75, _dec76, _dec77, _dec78, _dec79, _dec80, _dec81, _dec82, _dec83, _dec84, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39, _descriptor40, _descriptor41, _descriptor42, _descriptor43, _descriptor44, _descriptor45, _descriptor46, _descriptor47, _descriptor48, _descriptor49, _descriptor50, _descriptor51, _descriptor52, _descriptor53, _descriptor54, _descriptor55;
/* eslint-disable no-console */
// eslint-disable-next-line import/order
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Environment = exports.Environment = (_dec = (0, _classValidator.IsIn)(["development", "production", "staging", "test"]), _dec2 = (0, _classValidator.IsByteLength)(32, 64, {
  message: `The SECRET_KEY environment variable is invalid (Use \`openssl rand -hex 32\` to generate a value).`
}), _dec3 = (0, _classValidator.IsNotEmpty)(), _dec4 = (0, _classValidator.IsNotEmpty)(), _dec5 = (0, _classValidator.IsUrl)({
  require_tld: false,
  allow_underscores: true,
  protocols: ["postgres", "postgresql"]
}), _dec6 = (0, _classValidator.IsOptional)(), _dec7 = (0, _classValidator.IsOptional)(), _dec8 = (0, _classValidator.IsUrl)({
  require_tld: false,
  allow_underscores: true,
  protocols: ["postgres", "postgresql"]
}), _dec9 = (0, _classValidator.IsNumber)(), _dec10 = (0, _classValidator.IsOptional)(), _dec11 = (0, _classValidator.IsNumber)(), _dec12 = (0, _classValidator.IsOptional)(), _dec13 = (0, _classValidator.IsIn)(["disable", "allow", "require", "prefer", "verify-ca", "verify-full"]), _dec14 = (0, _classValidator.IsOptional)(), _dec15 = (0, _classValidator.IsNotEmpty)(), _dec16 = (0, _classValidator.IsNotEmpty)(), _dec17 = (0, _classValidator.IsUrl)({
  protocols: ["http", "https"],
  require_protocol: true,
  require_tld: false
}), _dec18 = (0, _classValidator.IsOptional)(), _dec19 = (0, _classValidator.IsUrl)({
  protocols: ["http", "https"],
  require_protocol: true,
  require_tld: false
}), _dec20 = (0, _classValidator.IsUrl)({
  require_tld: false,
  require_protocol: true,
  protocols: ["http", "https", "ws", "wss"]
}), _dec21 = (0, _classValidator.IsOptional)(), _dec22 = (0, _classValidator.IsOptional)(), _dec23 = (0, _classValidator.IsNumber)(), _dec24 = (0, _classValidator.IsNumber)(), _dec25 = (0, _classValidator.IsOptional)(), _dec26 = (0, _classValidator.IsIn)(["error", "warn", "info", "http", "verbose", "debug", "silly"]), _dec27 = (0, _classValidator.IsNumber)(), _dec28 = (0, _classValidator.IsOptional)(), _dec29 = (0, _classValidator.IsNumber)(), _dec30 = (0, _classValidator.IsOptional)(), _dec31 = (0, _classValidator.IsOptional)(), _dec32 = (0, _validators.CannotUseWithout)("SSL_CERT"), _dec33 = (0, _classValidator.IsOptional)(), _dec34 = (0, _validators.CannotUseWithout)("SSL_KEY"), _dec35 = (0, _classValidator.IsIn)(_i18n.languages), _dec36 = (0, _classValidator.IsBoolean)(), _dec37 = (0, _classValidator.IsBoolean)(), _dec38 = (0, _classValidator.IsNumber)(), _dec39 = (0, _classValidator.IsOptional)(), _dec40 = (0, _classValidator.IsEmail)({
  allow_display_name: true,
  allow_ip_domain: true
}), _dec41 = (0, _classValidator.IsOptional)(), _dec42 = (0, _classValidator.IsEmail)({
  allow_display_name: true,
  allow_ip_domain: true
}), _dec43 = (0, _classValidator.IsOptional)(), _dec44 = (0, _classValidator.IsOptional)(), _dec45 = (0, _classValidator.IsUrl)(), _dec46 = (0, _classValidator.IsOptional)(), _dec47 = (0, _classValidator.IsUrl)(), _dec48 = (0, _classValidator.IsOptional)(), _dec49 = (0, _classValidator.IsOptional)(), _dec50 = (0, _classValidator.IsOptional)(), _dec51 = (0, _classValidator.IsNumber)(), _dec52 = (0, _classValidator.IsOptional)(), _dec53 = (0, _classValidator.IsNumber)(), _dec54 = (0, _classValidator.IsOptional)(), _dec55 = (0, _classValidator.IsBoolean)(), _dec56 = (0, _classValidator.IsOptional)(), _dec57 = (0, _classValidator.IsNumber)(), _dec58 = (0, _validators.CannotUseWithout)("RATE_LIMITER_ENABLED"), _dec59 = (0, _classValidator.IsOptional)(), _dec60 = (0, _classValidator.IsNumber)(), _dec61 = (0, _classValidator.IsOptional)(), _dec62 = (0, _classValidator.IsNumber)(), _dec63 = (0, _validators.CannotUseWithout)("RATE_LIMITER_ENABLED"), _dec64 = (0, _classValidator.IsOptional)(), _dec65 = (0, _classValidator.IsNumber)(), _dec66 = (0, _Deprecated.default)("Use FILE_STORAGE_UPLOAD_MAX_SIZE instead"), _dec67 = (0, _classValidator.IsOptional)(), _dec68 = (0, _classValidator.IsOptional)(), _dec69 = (0, _validators.CannotUseWithout)("AWS_ACCESS_KEY_ID"), _dec70 = (0, _classValidator.IsOptional)(), _dec71 = (0, _classValidator.IsOptional)(), _dec72 = (0, _classValidator.IsOptional)(), _dec73 = (0, _classValidator.IsOptional)(), _dec74 = (0, _classValidator.IsOptional)(), _dec75 = (0, _classValidator.IsOptional)(), _dec76 = (0, _classValidator.IsIn)(["local", "s3"]), _dec77 = (0, _classValidator.IsNumber)(), _dec78 = (0, _classValidator.IsNumber)(), _dec79 = (0, _classValidator.IsNumber)(), _dec80 = (0, _classValidator.IsOptional)(), _dec81 = (0, _classValidator.IsNumber)(), _dec82 = (0, _Deprecated.default)("Use FILE_STORAGE_IMPORT_MAX_SIZE instead"), _dec83 = (0, _classValidator.IsNumber)(), _dec84 = (0, _classValidator.IsBoolean)(), _class = class Environment {
  constructor() {
    /**
     * The current environment name.
     */
    _initializerDefineProperty(this, "ENVIRONMENT", _descriptor, this);
    /**
     * The secret key is used for encrypting data. Do not change this value once
     * set or your users will be unable to login.
     */
    _initializerDefineProperty(this, "SECRET_KEY", _descriptor2, this);
    /**
     * The secret that should be passed to the cron utility endpoint to enable
     * triggering of scheduled tasks.
     */
    _initializerDefineProperty(this, "UTILS_SECRET", _descriptor3, this);
    /**
     * The url of the database.
     */
    _initializerDefineProperty(this, "DATABASE_URL", _descriptor4, this);
    /**
     * An optional database schema.
     */
    _initializerDefineProperty(this, "DATABASE_SCHEMA", _descriptor5, this);
    /**
     * The url of the database pool.
     */
    _initializerDefineProperty(this, "DATABASE_CONNECTION_POOL_URL", _descriptor6, this);
    /**
     * Database connection pool configuration.
     */
    _initializerDefineProperty(this, "DATABASE_CONNECTION_POOL_MIN", _descriptor7, this);
    /**
     * Database connection pool configuration.
     */
    _initializerDefineProperty(this, "DATABASE_CONNECTION_POOL_MAX", _descriptor8, this);
    /**
     * Set to "disable" to disable SSL connection to the database. This option is
     * passed through to Postgres. See:
     *
     * https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNECT-SSLMODE
     */
    _initializerDefineProperty(this, "PGSSLMODE", _descriptor9, this);
    /**
     * The url of redis. Note that redis does not have a database after the port.
     * Note: More extensive validation isn't included here due to our support for
     * base64-encoded configuration.
     */
    _initializerDefineProperty(this, "REDIS_URL", _descriptor10, this);
    /**
     * The fully qualified, external facing domain name of the server.
     */
    _initializerDefineProperty(this, "URL", _descriptor11, this);
    /**
     * If using a Cloudfront/Cloudflare distribution or similar it can be set below.
     * This will cause paths to javascript, stylesheets, and images to be updated to
     * the hostname defined in CDN_URL. In your CDN configuration the origin server
     * should be set to the same as URL.
     */
    _initializerDefineProperty(this, "CDN_URL", _descriptor12, this);
    /**
     * The fully qualified, external facing domain name of the collaboration
     * service, if different (unlikely)
     */
    _initializerDefineProperty(this, "COLLABORATION_URL", _descriptor13, this);
    /**
     * The maximum number of network clients that can be connected to a single
     * document at once. Defaults to 100.
     */
    _initializerDefineProperty(this, "COLLABORATION_MAX_CLIENTS_PER_DOCUMENT", _descriptor14, this);
    /**
     * The port that the server will listen on, defaults to 3000.
     */
    _initializerDefineProperty(this, "PORT", _descriptor15, this);
    /**
     * Optional extra debugging. Comma separated
     */
    _defineProperty(this, "DEBUG", _environment.default.DEBUG || "");
    /**
     * Configure lowest severity level for server logs
     */
    _initializerDefineProperty(this, "LOG_LEVEL", _descriptor16, this);
    /**
     * How many processes should be spawned. As a reasonable rule divide your
     * server's available memory by 512 for a rough estimate
     */
    _initializerDefineProperty(this, "WEB_CONCURRENCY", _descriptor17, this);
    /**
     * How long a request should be processed before giving up and returning an
     * error response to the client, defaults to 10s
     */
    _initializerDefineProperty(this, "REQUEST_TIMEOUT", _descriptor18, this);
    /**
     * Base64 encoded protected key if Outline is to perform SSL termination.
     */
    _initializerDefineProperty(this, "SSL_KEY", _descriptor19, this);
    /**
     * Base64 encoded public certificate if Outline is to perform SSL termination.
     */
    _initializerDefineProperty(this, "SSL_CERT", _descriptor20, this);
    /**
     * The default interface language. See translate.getoutline.com for a list of
     * available language codes and their percentage translated.
     */
    _initializerDefineProperty(this, "DEFAULT_LANGUAGE", _descriptor21, this);
    /**
     * A comma list of which services should be enabled on this instance – defaults to all.
     *
     * If a services flag is passed it takes priority over the environment variable
     * for example: --services=web,worker
     */
    _defineProperty(this, "SERVICES", (0, _uniq.default)(((0, _args.getArg)("services") ?? _environment.default.SERVICES ?? "collaboration,websockets,worker,web").split(",").map(service => service.toLowerCase().trim())));
    /**
     * Auto-redirect to https in production. The default is true but you may set
     * to false if you can be sure that SSL is terminated at an external
     * loadbalancer.
     */
    _initializerDefineProperty(this, "FORCE_HTTPS", _descriptor22, this);
    /**
     * Should the installation send anonymized statistics to the maintainers.
     * Defaults to true.
     */
    _initializerDefineProperty(this, "TELEMETRY", _descriptor23, this);
    /**
     * An optional comma separated list of allowed domains.
     */
    _defineProperty(this, "ALLOWED_DOMAINS", _environment.default.ALLOWED_DOMAINS ?? _environment.default.GOOGLE_ALLOWED_DOMAINS);
    // Third-party services
    /**
     * The host of your SMTP server for enabling emails.
     */
    _defineProperty(this, "SMTP_HOST", _environment.default.SMTP_HOST);
    _initializerDefineProperty(this, "EMAIL_ENABLED", _descriptor24, this);
    /**
     * Optional hostname of the client, used for identifying to the server
     * defaults to hostname of the machine.
     */
    _defineProperty(this, "SMTP_NAME", _environment.default.SMTP_NAME);
    /**
     * The port of your SMTP server.
     */
    _initializerDefineProperty(this, "SMTP_PORT", _descriptor25, this);
    /**
     * The username of your SMTP server, if any.
     */
    _defineProperty(this, "SMTP_USERNAME", _environment.default.SMTP_USERNAME);
    /**
     * The password for the SMTP username, if any.
     */
    _defineProperty(this, "SMTP_PASSWORD", _environment.default.SMTP_PASSWORD);
    /**
     * The email address from which emails are sent.
     */
    _initializerDefineProperty(this, "SMTP_FROM_EMAIL", _descriptor26, this);
    /**
     * The reply-to address for emails sent from Outline. If unset the from
     * address is used by default.
     */
    _initializerDefineProperty(this, "SMTP_REPLY_EMAIL", _descriptor27, this);
    /**
     * Override the cipher used for SMTP SSL connections.
     */
    _defineProperty(this, "SMTP_TLS_CIPHERS", this.toOptionalString(_environment.default.SMTP_TLS_CIPHERS));
    /**
     * If true (the default) the connection will use TLS when connecting to server.
     * If false then TLS is used only if server supports the STARTTLS extension.
     *
     * Setting secure to false therefore does not mean that you would not use an
     * encrypted connection.
     */
    _defineProperty(this, "SMTP_SECURE", this.toBoolean(_environment.default.SMTP_SECURE ?? "true"));
    /**
     * Dropbox app key for embedding Dropbox files
     */
    _initializerDefineProperty(this, "DROPBOX_APP_KEY", _descriptor28, this);
    /**
     * Sentry DSN for capturing errors and frontend performance.
     */
    _initializerDefineProperty(this, "SENTRY_DSN", _descriptor29, this);
    /**
     * Sentry tunnel URL for bypassing ad blockers
     */
    _initializerDefineProperty(this, "SENTRY_TUNNEL", _descriptor30, this);
    /**
     * A release SHA or other identifier for Sentry.
     */
    _defineProperty(this, "RELEASE", this.toOptionalString(_environment.default.RELEASE));
    /**
     * A Google Analytics tracking ID, supports v3 or v4 properties.
     */
    _initializerDefineProperty(this, "GOOGLE_ANALYTICS_ID", _descriptor31, this);
    /**
     * A DataDog API key for tracking server metrics.
     */
    _defineProperty(this, "DD_API_KEY", _environment.default.DD_API_KEY);
    /**
     * The name of the service to use in DataDog.
     */
    _defineProperty(this, "DD_SERVICE", _environment.default.DD_SERVICE ?? "outline");
    /**
     * A string representing the version of the software.
     *
     * SOURCE_COMMIT is used by Docker Hub
     * SOURCE_VERSION is used by Heroku
     */
    _initializerDefineProperty(this, "VERSION", _descriptor32, this);
    /**
     * The maximum number of concurrent events processed per-worker. To get total
     * concurrency you should multiply this by the number of workers.
     */
    _initializerDefineProperty(this, "WORKER_CONCURRENCY_EVENTS", _descriptor33, this);
    /**
     * The maximum number of concurrent tasks processed per-worker. To get total
     * concurrency you should multiply this by the number of workers.
     */
    _initializerDefineProperty(this, "WORKER_CONCURRENCY_TASKS", _descriptor34, this);
    /**
     * A boolean switch to toggle the rate limiter at application web server.
     */
    _initializerDefineProperty(this, "RATE_LIMITER_ENABLED", _descriptor35, this);
    /**
     * Set max allowed requests in a given duration for default rate limiter to
     * trigger throttling, per IP address.
     */
    _initializerDefineProperty(this, "RATE_LIMITER_REQUESTS", _descriptor36, this);
    /**
     * Set max allowed realtime connections before throttling. Defaults to 50
     * requests/ip/duration window.
     */
    _initializerDefineProperty(this, "RATE_LIMITER_COLLABORATION_REQUESTS", _descriptor37, this);
    /**
     * Set fixed duration window(in secs) for default rate limiter, elapsing which
     * the request quota is reset (the bucket is refilled with tokens).
     */
    _initializerDefineProperty(this, "RATE_LIMITER_DURATION_WINDOW", _descriptor38, this);
    /**
     * Set max allowed upload size for file attachments.
     * @deprecated Use FILE_STORAGE_UPLOAD_MAX_SIZE instead
     */
    _initializerDefineProperty(this, "AWS_S3_UPLOAD_MAX_SIZE", _descriptor39, this);
    /**
     * Access key ID for AWS S3.
     */
    _initializerDefineProperty(this, "AWS_ACCESS_KEY_ID", _descriptor40, this);
    /**
     * Secret key for AWS S3.
     */
    _initializerDefineProperty(this, "AWS_SECRET_ACCESS_KEY", _descriptor41, this);
    /**
     * The name of the AWS S3 region to use.
     */
    _initializerDefineProperty(this, "AWS_REGION", _descriptor42, this);
    /**
     * Optional AWS S3 endpoint URL for file attachments.
     */
    _initializerDefineProperty(this, "AWS_S3_ACCELERATE_URL", _descriptor43, this);
    /**
     * Optional AWS S3 endpoint URL for file attachments.
     */
    _initializerDefineProperty(this, "AWS_S3_UPLOAD_BUCKET_URL", _descriptor44, this);
    /**
     * The bucket name to store file attachments in.
     */
    _initializerDefineProperty(this, "AWS_S3_UPLOAD_BUCKET_NAME", _descriptor45, this);
    /**
     * Whether to force path style URLs for S3 objects, this is required for some
     * S3-compatible storage providers.
     */
    _initializerDefineProperty(this, "AWS_S3_FORCE_PATH_STYLE", _descriptor46, this);
    /**
     * Set default AWS S3 ACL for file attachments.
     */
    _initializerDefineProperty(this, "AWS_S3_ACL", _descriptor47, this);
    /**
     * Which file storage system to use
     */
    _initializerDefineProperty(this, "FILE_STORAGE", _descriptor48, this);
    /**
     * Set default root dir path for local file storage
     */
    _defineProperty(this, "FILE_STORAGE_LOCAL_ROOT_DIR", this.toOptionalString(_environment.default.FILE_STORAGE_LOCAL_ROOT_DIR) ?? "/var/lib/outline/data");
    /**
     * Set max allowed upload size for file attachments.
     */
    _initializerDefineProperty(this, "FILE_STORAGE_UPLOAD_MAX_SIZE", _descriptor49, this);
    /**
     * Set max allowed upload size for document imports.
     */
    _initializerDefineProperty(this, "FILE_STORAGE_IMPORT_MAX_SIZE", _descriptor50, this);
    /**
     * Set max allowed upload size for imports at workspace level.
     */
    _initializerDefineProperty(this, "FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE", _descriptor51, this);
    /**
     * Because imports can be much larger than regular file attachments and are
     * deleted automatically we allow an optional separate limit on the size of
     * imports.
     *
     * @deprecated Use `FILE_STORAGE_IMPORT_MAX_SIZE` or `FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE` instead
     */
    _initializerDefineProperty(this, "MAXIMUM_IMPORT_SIZE", _descriptor52, this);
    /**
     * Limit on export size in bytes. Defaults to the total memory available to
     * the container.
     */
    _initializerDefineProperty(this, "MAXIMUM_EXPORT_SIZE", _descriptor53, this);
    /**
     * Enable unsafe-inline in script-src CSP directive
     */
    _initializerDefineProperty(this, "DEVELOPMENT_UNSAFE_INLINE_CSP", _descriptor54, this);
    /**
     * The product name
     */
    _initializerDefineProperty(this, "APP_NAME", _descriptor55, this);
    process.nextTick(() => {
      void (0, _classValidator.validate)(this).then(errors => {
        if (errors.length > 0) {
          let output = "Environment configuration is invalid, please check the following:\n\n";
          output += errors.map(error => "- " + Object.values(error.constraints ?? {}).join(", "));
          console.warn(output);
          process.exit(1);
        }
      });
    });
    _Public.PublicEnvironmentRegister.registerEnv(this);
  }

  /**
   * Returns an object consisting of env vars annotated with `@Public` decorator
   */
  get public() {
    return _Public.PublicEnvironmentRegister.getEnv();
  }
  /**
   * Returns true if the current installation is the cloud hosted version at
   * getoutline.com
   */
  get isCloudHosted() {
    return ["https://app.getoutline.com", "https://app.outline.dev", "https://app.outline.dev:3000"].includes(this.URL);
  }

  /**
   * Returns true if the current installation is running in production.
   */
  get isProduction() {
    return this.ENVIRONMENT === "production";
  }

  /**
   * Returns true if the current installation is running in the development environment.
   */
  get isDevelopment() {
    return this.ENVIRONMENT === "development";
  }

  /**
   * Returns true if the current installation is running in a test environment.
   */
  get isTest() {
    return this.ENVIRONMENT === "test";
  }
  toOptionalString(value) {
    return value ? value : undefined;
  }
  toOptionalCommaList(value) {
    return value ? value.split(",").map(item => item.trim()) : undefined;
  }
  toOptionalNumber(value) {
    return value ? parseInt(value, 10) : undefined;
  }

  /**
   * Convert a string to a boolean. Supports the following:
   *
   * 0 = false
   * 1 = true
   * "true" = true
   * "false" = false
   * "" = false
   *
   * @param value The string to convert
   * @returns A boolean
   */
  toBoolean(value) {
    try {
      return value ? !!JSON.parse(value) : false;
    } catch (err) {
      throw new Error(`"${value}" could not be parsed as a boolean, must be "true" or "false"`);
    }
  }

  /**
   * Convert a string to an optional boolean. Supports the following:
   *
   * 0 = false
   * 1 = true
   * "true" = true
   * "false" = false
   * "" = undefined
   *
   * @param value The string to convert
   * @returns A boolean or undefined
   */
  toOptionalBoolean(value) {
    try {
      return value ? !!JSON.parse(value) : undefined;
    } catch (err) {
      return undefined;
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class.prototype, "ENVIRONMENT", [_Public.Public, _dec], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.NODE_ENV ?? "production";
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "SECRET_KEY", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.SECRET_KEY ?? "";
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "UTILS_SECRET", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.UTILS_SECRET ?? "";
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_URL", [_dec4, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.DATABASE_URL ?? "";
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_SCHEMA", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_SCHEMA);
  }
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_CONNECTION_POOL_URL", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_CONNECTION_POOL_URL);
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_CONNECTION_POOL_MIN", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.DATABASE_CONNECTION_POOL_MIN);
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_CONNECTION_POOL_MAX", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.DATABASE_CONNECTION_POOL_MAX);
  }
}), _descriptor9 = _applyDecoratedDescriptor(_class.prototype, "PGSSLMODE", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.PGSSLMODE;
  }
}), _descriptor10 = _applyDecoratedDescriptor(_class.prototype, "REDIS_URL", [_dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.REDIS_URL;
  }
}), _descriptor11 = _applyDecoratedDescriptor(_class.prototype, "URL", [_Public.Public, _dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return (_environment.default.URL ?? "").replace(/\/$/, "");
  }
}), _descriptor12 = _applyDecoratedDescriptor(_class.prototype, "CDN_URL", [_Public.Public, _dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.CDN_URL ? _environment.default.CDN_URL.replace(/\/$/, "") : undefined);
  }
}), _descriptor13 = _applyDecoratedDescriptor(_class.prototype, "COLLABORATION_URL", [_Public.Public, _dec20, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return (_environment.default.COLLABORATION_URL || this.URL).replace(/\/$/, "").replace(/^http/, "ws");
  }
}), _descriptor14 = _applyDecoratedDescriptor(_class.prototype, "COLLABORATION_MAX_CLIENTS_PER_DOCUMENT", [_dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return parseInt(_environment.default.COLLABORATION_MAX_CLIENTS_PER_DOCUMENT || "100", 10);
  }
}), _descriptor15 = _applyDecoratedDescriptor(_class.prototype, "PORT", [_dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.PORT) ?? 3000;
  }
}), _descriptor16 = _applyDecoratedDescriptor(_class.prototype, "LOG_LEVEL", [_dec26], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.LOG_LEVEL || "info";
  }
}), _descriptor17 = _applyDecoratedDescriptor(_class.prototype, "WEB_CONCURRENCY", [_dec27, _dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WEB_CONCURRENCY);
  }
}), _descriptor18 = _applyDecoratedDescriptor(_class.prototype, "REQUEST_TIMEOUT", [_dec29, _dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.REQUEST_TIMEOUT) ?? 10 * 1000;
  }
}), _descriptor19 = _applyDecoratedDescriptor(_class.prototype, "SSL_KEY", [_dec31, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SSL_KEY);
  }
}), _descriptor20 = _applyDecoratedDescriptor(_class.prototype, "SSL_CERT", [_dec33, _dec34], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SSL_CERT);
  }
}), _descriptor21 = _applyDecoratedDescriptor(_class.prototype, "DEFAULT_LANGUAGE", [_Public.Public, _dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.DEFAULT_LANGUAGE ?? "en_US";
  }
}), _descriptor22 = _applyDecoratedDescriptor(_class.prototype, "FORCE_HTTPS", [_dec36], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.FORCE_HTTPS ?? "true");
  }
}), _descriptor23 = _applyDecoratedDescriptor(_class.prototype, "TELEMETRY", [_dec37], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.ENABLE_UPDATES ?? _environment.default.TELEMETRY ?? "true");
  }
}), _descriptor24 = _applyDecoratedDescriptor(_class.prototype, "EMAIL_ENABLED", [_Public.Public], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return !!this.SMTP_HOST || this.isDevelopment;
  }
}), _descriptor25 = _applyDecoratedDescriptor(_class.prototype, "SMTP_PORT", [_dec38, _dec39], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.SMTP_PORT);
  }
}), _descriptor26 = _applyDecoratedDescriptor(_class.prototype, "SMTP_FROM_EMAIL", [_dec40, _dec41], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SMTP_FROM_EMAIL);
  }
}), _descriptor27 = _applyDecoratedDescriptor(_class.prototype, "SMTP_REPLY_EMAIL", [_dec42, _dec43], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SMTP_REPLY_EMAIL);
  }
}), _descriptor28 = _applyDecoratedDescriptor(_class.prototype, "DROPBOX_APP_KEY", [_Public.Public, _dec44], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DROPBOX_APP_KEY);
  }
}), _descriptor29 = _applyDecoratedDescriptor(_class.prototype, "SENTRY_DSN", [_Public.Public, _dec45, _dec46], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SENTRY_DSN);
  }
}), _descriptor30 = _applyDecoratedDescriptor(_class.prototype, "SENTRY_TUNNEL", [_Public.Public, _dec47, _dec48], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SENTRY_TUNNEL);
  }
}), _descriptor31 = _applyDecoratedDescriptor(_class.prototype, "GOOGLE_ANALYTICS_ID", [_Public.Public, _dec49], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.GOOGLE_ANALYTICS_ID);
  }
}), _descriptor32 = _applyDecoratedDescriptor(_class.prototype, "VERSION", [_Public.Public], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SOURCE_COMMIT || _environment.default.SOURCE_VERSION);
  }
}), _descriptor33 = _applyDecoratedDescriptor(_class.prototype, "WORKER_CONCURRENCY_EVENTS", [_dec50, _dec51], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WORKER_CONCURRENCY_EVENTS) ?? 10;
  }
}), _descriptor34 = _applyDecoratedDescriptor(_class.prototype, "WORKER_CONCURRENCY_TASKS", [_dec52, _dec53], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WORKER_CONCURRENCY_TASKS) ?? 10;
  }
}), _descriptor35 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_ENABLED", [_dec54, _dec55], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.RATE_LIMITER_ENABLED ?? "false");
  }
}), _descriptor36 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_REQUESTS", [_dec56, _dec57, _dec58], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.RATE_LIMITER_REQUESTS) ?? 1000;
  }
}), _descriptor37 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_COLLABORATION_REQUESTS", [_dec59, _dec60], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.RATE_LIMITER_COLLABORATION_REQUESTS) ?? 50;
  }
}), _descriptor38 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_DURATION_WINDOW", [_dec61, _dec62, _dec63], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.RATE_LIMITER_DURATION_WINDOW) ?? 60;
  }
}), _descriptor39 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_UPLOAD_MAX_SIZE", [_dec64, _dec65, _dec66], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.AWS_S3_UPLOAD_MAX_SIZE);
  }
}), _descriptor40 = _applyDecoratedDescriptor(_class.prototype, "AWS_ACCESS_KEY_ID", [_dec67], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_ACCESS_KEY_ID);
  }
}), _descriptor41 = _applyDecoratedDescriptor(_class.prototype, "AWS_SECRET_ACCESS_KEY", [_dec68, _dec69], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_SECRET_ACCESS_KEY);
  }
}), _descriptor42 = _applyDecoratedDescriptor(_class.prototype, "AWS_REGION", [_dec70], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_REGION);
  }
}), _descriptor43 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_ACCELERATE_URL", [_Public.Public, _dec71], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.AWS_S3_ACCELERATE_URL ?? "";
  }
}), _descriptor44 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_UPLOAD_BUCKET_URL", [_Public.Public, _dec72], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.AWS_S3_UPLOAD_BUCKET_URL ?? "";
  }
}), _descriptor45 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_UPLOAD_BUCKET_NAME", [_dec73], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_S3_UPLOAD_BUCKET_NAME);
  }
}), _descriptor46 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_FORCE_PATH_STYLE", [_dec74], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.AWS_S3_FORCE_PATH_STYLE ?? "true");
  }
}), _descriptor47 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_ACL", [_dec75], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.AWS_S3_ACL ?? "private";
  }
}), _descriptor48 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE", [_dec76], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.FILE_STORAGE) ?? "s3";
  }
}), _descriptor49 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE_UPLOAD_MAX_SIZE", [_dec77], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.FILE_STORAGE_UPLOAD_MAX_SIZE) ?? this.toOptionalNumber(_environment.default.AWS_S3_UPLOAD_MAX_SIZE) ?? 1000000;
  }
}), _descriptor50 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE_IMPORT_MAX_SIZE", [_Public.Public, _dec78], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.FILE_STORAGE_IMPORT_MAX_SIZE) ?? this.toOptionalNumber(_environment.default.MAXIMUM_IMPORT_SIZE) ?? this.toOptionalNumber(_environment.default.FILE_STORAGE_UPLOAD_MAX_SIZE) ?? 1000000;
  }
}), _descriptor51 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE", [_dec79], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE) ?? this.toOptionalNumber(_environment.default.MAXIMUM_IMPORT_SIZE) ?? this.toOptionalNumber(_environment.default.FILE_STORAGE_UPLOAD_MAX_SIZE) ?? 1000000;
  }
}), _descriptor52 = _applyDecoratedDescriptor(_class.prototype, "MAXIMUM_IMPORT_SIZE", [_dec80, _dec81, _dec82], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.MAXIMUM_IMPORT_SIZE);
  }
}), _descriptor53 = _applyDecoratedDescriptor(_class.prototype, "MAXIMUM_EXPORT_SIZE", [_dec83], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.MAXIMUM_EXPORT_SIZE) ?? _os.default.totalmem();
  }
}), _descriptor54 = _applyDecoratedDescriptor(_class.prototype, "DEVELOPMENT_UNSAFE_INLINE_CSP", [_dec84], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.DEVELOPMENT_UNSAFE_INLINE_CSP ?? "false");
  }
}), _descriptor55 = _applyDecoratedDescriptor(_class.prototype, "APP_NAME", [_Public.Public], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return "Outline";
  }
}), _class);
var _default = exports.default = new Environment();