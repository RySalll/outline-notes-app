"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateColorHex = exports.toRGB = exports.stringToColor = exports.palette = exports.getTextColor = void 0;
var _md = _interopRequireDefault(require("crypto-js/md5"));
var _polished = require("polished");
var _theme = _interopRequireDefault(require("../styles/theme"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const palette = exports.palette = [_theme.default.brand.red, _theme.default.brand.blue, _theme.default.brand.purple, _theme.default.brand.pink, _theme.default.brand.dusk, _theme.default.brand.green, _theme.default.brand.yellow, (0, _polished.darken)(0.2, _theme.default.brand.red), (0, _polished.darken)(0.2, _theme.default.brand.blue), (0, _polished.darken)(0.2, _theme.default.brand.purple), (0, _polished.darken)(0.2, _theme.default.brand.pink), (0, _polished.darken)(0.2, _theme.default.brand.dusk), (0, _polished.darken)(0.2, _theme.default.brand.green), (0, _polished.darken)(0.2, _theme.default.brand.yellow)];
const validateColorHex = color => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
exports.validateColorHex = validateColorHex;
const stringToColor = input => {
  const inputAsNumber = parseInt((0, _md.default)(input).toString(), 16);
  return palette[inputAsNumber % palette.length];
};

/**
 * Converts a color to string of RGB values separated by commas
 *
 * @param color - A color string
 * @returns A string of RGB values separated by commas
 */
exports.stringToColor = stringToColor;
const toRGB = color => Object.values((0, _polished.parseToRgb)(color)).join(", ");

/**
 * Returns the text color that contrasts the given background color
 *
 * @param background - A color string
 * @returns A color string
 */
exports.toRGB = toRGB;
const getTextColor = background => {
  const r = parseInt(background.substring(1, 3), 16);
  const g = parseInt(background.substring(3, 5), 16);
  const b = parseInt(background.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
};
exports.getTextColor = getTextColor;