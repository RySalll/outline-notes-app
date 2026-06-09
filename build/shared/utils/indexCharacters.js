"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateIndexCharacters = void 0;
const validateIndexCharacters = index => new RegExp("^[\x20-\x7E]+$").test(index);
exports.validateIndexCharacters = validateIndexCharacters;