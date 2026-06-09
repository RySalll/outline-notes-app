"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transaction = transaction;
var _database = require("./../storage/database");
/**
 * Middleware that wraps a route in a database transaction, useful for mutations
 * The transaction is available on the context as `ctx.state.transaction` and
 * should be passed to all database calls within the route.
 *
 * @returns The middleware function.
 */
function transaction() {
  return async function transactionMiddleware(ctx, next) {
    await _database.sequelize.transaction(async t => {
      ctx.state.transaction = t;
      return next();
    });
  };
}