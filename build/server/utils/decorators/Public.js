"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Public = Public;
exports.PublicEnvironmentRegister = void 0;
require("reflect-metadata");
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const key = Symbol("env:public");

/**
 * This decorator on an environment variable makes that variable available client-side
 */
function Public(target, propertyKey) {
  const publicVars = Reflect.getMetadata(key, target);
  if (!publicVars) {
    return Reflect.defineMetadata(key, [propertyKey], target);
  }
  publicVars.push(propertyKey);
}
class PublicEnvironmentRegister {
  static registerEnv(env) {
    process.nextTick(() => {
      const vars = Reflect.getMetadata(key, env) ?? [];
      vars.forEach(k => {
        if ((0, _isUndefined.default)(this.publicEnv[k])) {
          this.publicEnv[k] = env[k];
        }
      });
    });
  }
  static getEnv() {
    return this.publicEnv;
  }
}
exports.PublicEnvironmentRegister = PublicEnvironmentRegister;
_defineProperty(PublicEnvironmentRegister, "publicEnv", {});