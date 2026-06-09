"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CounterCache = CounterCache;
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _env = _interopRequireDefault(require("./../../env"));
var _CacheHelper = require("./../../utils/CacheHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A decorator that caches the count of a relationship and registers model lifecycle hooks
 * to invalidate the cache when models are added or removed from the relationship.
 */
function CounterCache(classResolver, options) {
  return function (target, _propertyKey) {
    if (_env.default.isTest) {
      // No-op cache in test environment
      return;
    }
    const modelClass = classResolver();
    const cacheKeyPrefix = `count:${target.constructor.name}:${options.as}`;

    // Add hooks after model is added to the sequelize instance
    setImmediate(() => {
      const recalculateCache = offset => async model => {
        const cacheKey = `${cacheKeyPrefix}:${model[options.foreignKey]}`;
        const count = await modelClass.count({
          where: {
            [options.foreignKey]: model[options.foreignKey]
          }
        });
        await _CacheHelper.CacheHelper.setData(cacheKey, count + offset);
      };

      // Because the transaction is not complete until after the response is sent, we need to
      // offset the count by 1 to account for the record. TODO: Need to find a better way to handle
      // this as a rollback would not decrement the count.
      modelClass.addHook("afterCreate", recalculateCache(1));
      modelClass.addHook("afterDestroy", recalculateCache(-1));
    });
    return {
      get() {
        const cacheKey = `${cacheKeyPrefix}:${this.id}`;
        return _CacheHelper.CacheHelper.getData(cacheKey).then(value => {
          if (!(0, _isNil.default)(value)) {
            return value;
          }

          // calculate and cache count
          return modelClass.count({
            where: {
              [options.foreignKey]: this.id
            }
          }).then(count => {
            void _CacheHelper.CacheHelper.setData(cacheKey, count);
            return count;
          });
        });
      }
    };
  };
}