"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/* eslint-disable @typescript-eslint/ban-types */

const Deprecated = message => (target, propertyKey) => {
  if (process.env[propertyKey]) {
    // eslint-disable-next-line no-console
    console.warn(`The environment variable ${propertyKey} is deprecated and will be removed in a future release. ${message}`);
  }
};
var _default = exports.default = Deprecated;