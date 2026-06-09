"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkConnection = void 0;
exports.createDatabaseInstance = createDatabaseInstance;
exports.createMigrationRunner = createMigrationRunner;
exports.sequelize = exports.migrations = void 0;
var _path = _interopRequireDefault(require("path"));
var _sequelizeTypescript = require("sequelize-typescript");
var _umzug = require("umzug");
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var models = _interopRequireWildcard(require("../models"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const isSSLDisabled = _env.default.PGSSLMODE === "disable";
const poolMax = _env.default.DATABASE_CONNECTION_POOL_MAX ?? 5;
const poolMin = _env.default.DATABASE_CONNECTION_POOL_MIN ?? 0;
const url = _env.default.DATABASE_CONNECTION_POOL_URL || _env.default.DATABASE_URL;
const schema = _env.default.DATABASE_SCHEMA;
function createDatabaseInstance(databaseUrl, input) {
  try {
    return new _sequelizeTypescript.Sequelize(databaseUrl, {
      logging: msg => process.env.DEBUG?.includes("database") && _Logger.default.debug("database", msg),
      typeValidation: true,
      logQueryParameters: _env.default.isDevelopment,
      dialectOptions: {
        ssl: _env.default.isProduction && !isSSLDisabled ? {
          // Ref.: https://github.com/brianc/node-postgres/issues/2009
          rejectUnauthorized: false
        } : false
      },
      models: Object.values(input),
      pool: {
        max: poolMax,
        min: poolMin,
        acquire: 30000,
        idle: 10000
      },
      schema
    });
  } catch (error) {
    if (error instanceof URIError) {
      _Logger.default.fatal("Could not connect to database", new Error(`Failed to parse: ${databaseUrl}, ensure special characters in database URL are properly encoded`));
      process.exit(1);
    }
    throw error;
  }
}

/**
 * This function is used to test the database connection on startup. It will
 * throw a descriptive error if the connection fails.
 */
const checkConnection = async db => {
  try {
    await db.authenticate();
  } catch (error) {
    if (error.message.includes("does not support SSL")) {
      _Logger.default.fatal("The database does not support SSL connections. Set the `PGSSLMODE` environment variable to `disable` or enable SSL on your database server.", error);
    } else {
      _Logger.default.fatal("Failed to connect to database", error);
    }
  }
};
exports.checkConnection = checkConnection;
function createMigrationRunner(db, glob) {
  return new _umzug.Umzug({
    migrations: {
      glob,
      resolve: _ref => {
        let {
          name,
          path,
          context
        } = _ref;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context, _sequelizeTypescript.Sequelize),
          down: async () => migration.down(context, _sequelizeTypescript.Sequelize)
        };
      }
    },
    context: db.getQueryInterface(),
    storage: new _umzug.SequelizeStorage({
      sequelize: db
    }),
    logger: {
      warn: params => _Logger.default.warn("database", params),
      error: params => _Logger.default.error(params.message, params),
      info: params => _Logger.default.info("database", params.event === "migrating" ? `Migrating ${params.name}…` : `Migrated ${params.name} in ${params.durationSeconds}s`),
      debug: params => _Logger.default.debug("database", params.event === "migrating" ? `Migrating ${params.name}…` : `Migrated ${params.name} in ${params.durationSeconds}s`)
    }
  });
}
const sequelize = exports.sequelize = createDatabaseInstance(url, models);
const migrations = exports.migrations = createMigrationRunner(sequelize, ["migrations/*.js", {
  cwd: _path.default.resolve("server")
}]);