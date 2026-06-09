"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CacheHelper = void 0;
var _time = require("./../../shared/utils/time");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _redis = _interopRequireDefault(require("./../storage/redis"));
var _MutexLock = require("./MutexLock");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * A Helper class for server-side cache management
 */
class CacheHelper {
  /**
   * Given a key this method will attempt to get the data from cache store first
   * If data is not found, it will call the callback to get the data and save it in cache
   * using a distributed lock to prevent multiple writes.
   *
   * @param key Cache key
   * @param callback Callback to get the data if not found in cache
   * @param expiry Cache data expiry in seconds
   */
  static async getDataOrSet(key, callback, expiry) {
    let cache = await this.getData(key);
    if (cache) {
      return cache;
    }

    // Nothing in the cache, acquire a lock to prevent multiple writes
    let lock;
    const lockKey = `lock:${key}`;
    try {
      try {
        lock = await _MutexLock.MutexLock.lock.acquire([lockKey], _MutexLock.MutexLock.defaultLockTimeout);
      } catch (err) {
        _Logger.default.error(`Could not acquire lock for ${key}`, err);
      }
      cache = await this.getData(key);
      if (cache) {
        return cache;
      }

      // Get the data from the callback and save it in cache
      const value = await callback();
      if (value) {
        await this.setData(key, value, expiry);
      }
      return value;
    } finally {
      await lock?.release();
    }
  }

  /**
   * Given a key, gets the data from cache store
   *
   * @param key Key against which data will be accessed
   */
  static async getData(key) {
    try {
      const data = await _redis.default.defaultClient.get(key);
      if (data !== null) {
        return JSON.parse(data);
      }
    } catch (err) {
      // just log it, response can still be obtained using the fetch call
      _Logger.default.error(`Could not fetch cached response against ${key}`, err);
    }
    return;
  }

  /**
   * Given a key, data and cache config, saves the data in cache store
   *
   * @param key Cache key
   * @param data Data to be saved against the key
   * @param expiry Cache data expiry in seconds
   */
  static async setData(key, data, expiry) {
    try {
      await _redis.default.defaultClient.set(key, JSON.stringify(data), "EX", expiry || CacheHelper.defaultDataExpiry);
    } catch (err) {
      // just log it, can skip caching and directly return response
      _Logger.default.error(`Could not cache response against ${key}`, err);
    }
  }

  /**
   * Clears all cache data with the given prefix
   *
   * @param prefix Prefix to clear cache data
   */
  static async clearData(prefix) {
    const keys = await _redis.default.defaultClient.keys(`${prefix}*`);
    await Promise.all(keys.map(async key => {
      await _redis.default.defaultClient.del(key);
    }));
  }

  // keys

  /**
   * Gets key against which unfurl response for the given url is stored
   *
   * @param teamId The team ID to generate a key for
   * @param url The url to generate a key for
   */
  static getUnfurlKey(teamId) {
    let url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    return `unfurl:${teamId}:${url}`;
  }
}
exports.CacheHelper = CacheHelper;
// Default expiry time for cache data in seconds
_defineProperty(CacheHelper, "defaultDataExpiry", _time.Day.seconds);