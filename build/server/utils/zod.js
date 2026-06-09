"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zodEnumFromObjectKeys = zodEnumFromObjectKeys;
exports.zodTimezone = exports.zodIdType = exports.zodIconType = void 0;
var _emojiRegex = _interopRequireDefault(require("emoji-regex"));
var _zod = require("zod");
var _IconLibrary = require("./../../shared/utils/IconLibrary");
var _UrlHelper = require("./../../shared/utils/UrlHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function zodEnumFromObjectKeys(input) {
  const [firstKey, ...otherKeys] = Object.keys(input);
  return _zod.z.enum([firstKey, ...otherKeys]);
}
const zodIdType = () => _zod.z.union([_zod.z.string().regex(_UrlHelper.UrlHelper.SLUG_URL_REGEX), _zod.z.string().uuid()], {
  message: "Must be a valid UUID or slug"
});
exports.zodIdType = zodIdType;
const zodIconType = () => _zod.z.union([_zod.z.string().regex((0, _emojiRegex.default)()), zodEnumFromObjectKeys(_IconLibrary.IconLibrary.mapping)]);
exports.zodIconType = zodIconType;
const zodTimezone = () => _zod.z.string().refine(timezone => {
  try {
    Intl.DateTimeFormat(undefined, {
      timeZone: timezone
    });
    return true;
  } catch {
    return false;
  }
}, {
  message: "invalid timezone"
});
exports.zodTimezone = zodTimezone;