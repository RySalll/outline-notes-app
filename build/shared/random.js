"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomInteger = exports.randomElement = void 0;
const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
exports.randomInteger = randomInteger;
const randomElement = arr => arr[randomInteger(0, arr.length - 1)];
exports.randomElement = randomElement;