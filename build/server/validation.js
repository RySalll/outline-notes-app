"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidateURL = exports.ValidateKey = exports.ValidateIndex = exports.ValidateDocumentId = exports.ValidateColor = void 0;
exports.assertArray = assertArray;
exports.assertBoolean = assertBoolean;
exports.assertCollectionPermission = void 0;
exports.assertEmail = assertEmail;
exports.assertIndexCharacters = exports.assertIn = exports.assertHexColor = void 0;
exports.assertKeysIn = assertKeysIn;
exports.assertNotEmpty = assertNotEmpty;
exports.assertSort = exports.assertPresent = exports.assertPositiveInteger = void 0;
exports.assertUrl = assertUrl;
exports.assertUuid = assertUuid;
exports.assertValueInArray = void 0;
var _isArrayLike = _interopRequireDefault(require("lodash/isArrayLike"));
var _sanitizeFilename = _interopRequireDefault(require("sanitize-filename"));
var _validator = _interopRequireDefault(require("validator"));
var _isIn = _interopRequireDefault(require("validator/lib/isIn"));
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _types = require("./../shared/types");
var _UrlHelper = require("./../shared/utils/UrlHelper");
var _color = require("./../shared/utils/color");
var _indexCharacters = require("./../shared/utils/indexCharacters");
var _parseMentionUrl = _interopRequireDefault(require("./../shared/utils/parseMentionUrl"));
var _urls = require("./../shared/utils/urls");
var _errors = require("./errors");
var _AttachmentHelper = require("./models/helpers/AttachmentHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const assertPresent = (value, message) => {
  if (value === undefined || value === null || value === "") {
    throw (0, _errors.ParamRequiredError)(message);
  }
};
exports.assertPresent = assertPresent;
function assertArray(value, message) {
  if (!(0, _isArrayLike.default)(value)) {
    throw (0, _errors.ValidationError)(message);
  }
}
const assertIn = (value, options, message) => {
  if (!options.includes(value)) {
    throw (0, _errors.ValidationError)(message ?? `Must be one of ${options.join(", ")}`);
  }
};

/**
 * Asserts that an object contains no other keys than specified
 * by a type
 *
 * @param obj The object to check for assertion
 * @param type The type to check against
 * @throws {ValidationError}
 */
exports.assertIn = assertIn;
function assertKeysIn(obj, type) {
  Object.keys(obj).forEach(key => assertIn(key, Object.values(type)));
}
const assertSort = function (value, model) {
  let message = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "Invalid sort parameter";
  if (!Object.keys(model.rawAttributes).includes(value)) {
    throw (0, _errors.ValidationError)(message);
  }
};
exports.assertSort = assertSort;
function assertNotEmpty(value, message) {
  assertPresent(value, message);
  if (typeof value === "string" && value.trim() === "") {
    throw (0, _errors.ValidationError)(message);
  }
}
function assertEmail() {
  let value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  let message = arguments.length > 1 ? arguments[1] : undefined;
  if (typeof value !== "string" || !_validator.default.isEmail(value)) {
    throw (0, _errors.ValidationError)(message);
  }
}
function assertUrl() {
  let value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  let message = arguments.length > 1 ? arguments[1] : undefined;
  if (typeof value !== "string" || !_validator.default.isURL(value, {
    protocols: ["http", "https"],
    require_valid_protocol: true
  })) {
    throw (0, _errors.ValidationError)(message ?? `${String(value)} is an invalid url`);
  }
}

/**
 * Asserts that the passed value is a valid boolean
 *
 * @param value The value to check for assertion
 * @param [message] The error message to show
 * @throws {ValidationError}
 */
function assertBoolean(value, message) {
  if (typeof value !== "boolean") {
    throw (0, _errors.ValidationError)(message ?? `${String(value)} is not a boolean`);
  }
}
function assertUuid(value, message) {
  if (typeof value !== "string") {
    throw (0, _errors.ValidationError)(message);
  }
  if (!_validator.default.isUUID(value)) {
    throw (0, _errors.ValidationError)(message);
  }
}
const assertPositiveInteger = (value, message) => {
  if (!_validator.default.isInt(String(value), {
    min: 0
  })) {
    throw (0, _errors.ValidationError)(message);
  }
};
exports.assertPositiveInteger = assertPositiveInteger;
const assertHexColor = (value, message) => {
  if (!(0, _color.validateColorHex)(value)) {
    throw (0, _errors.ValidationError)(message);
  }
};
exports.assertHexColor = assertHexColor;
const assertValueInArray = (value, values, message) => {
  if (!values.includes(value)) {
    throw (0, _errors.ValidationError)(message);
  }
};
exports.assertValueInArray = assertValueInArray;
const assertIndexCharacters = function (value) {
  let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "index must be between x20 to x7E ASCII";
  if (!(0, _indexCharacters.validateIndexCharacters)(value)) {
    throw (0, _errors.ValidationError)(message);
  }
};
exports.assertIndexCharacters = assertIndexCharacters;
const assertCollectionPermission = function (value) {
  let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Invalid permission";
  assertIn(value, [...Object.values(_types.CollectionPermission), null], message);
};
exports.assertCollectionPermission = assertCollectionPermission;
class ValidateKey {}
exports.ValidateKey = ValidateKey;
/**
 * Checks if key is valid. A valid key is of the form
 * <bucket>/<uuid>/<uuid>/<name>
 *
 * @param key
 * @returns true if key is valid, false otherwise
 */
_defineProperty(ValidateKey, "isValid", key => {
  let parts = key.split("/");
  const bucket = parts[0];

  // Avatars do not have a file name at the end of the key
  parts = bucket === _AttachmentHelper.Buckets.avatars ? parts : parts.slice(0, -1);
  return parts.length === 3 && (0, _isIn.default)(parts[0], Object.values(_AttachmentHelper.Buckets)) && (0, _isUUID.default)(parts[1]) && (0, _isUUID.default)(parts[2]);
});
/**
 * Sanitizes a key by removing any invalid characters
 *
 * @param key
 * @returns sanitized key
 */
_defineProperty(ValidateKey, "sanitize", key => {
  const [filename] = key.split("/").slice(-1);
  return key.split("/").slice(0, -1).filter(part => part !== "" && part !== ".." && part !== ".").join("/").concat(`/${(0, _sanitizeFilename.default)(filename)}`);
});
_defineProperty(ValidateKey, "message", "Must be of the form <bucket>/<uuid>/<uuid>/<name>");
class ValidateDocumentId {}
exports.ValidateDocumentId = ValidateDocumentId;
/**
 * Checks if documentId is valid. A valid documentId is either
 * a UUID or a url slug matching a particular regex.
 *
 * @param documentId
 * @returns true if documentId is valid, false otherwise
 */
_defineProperty(ValidateDocumentId, "isValid", documentId => (0, _isUUID.default)(documentId) || _UrlHelper.UrlHelper.SLUG_URL_REGEX.test(documentId));
_defineProperty(ValidateDocumentId, "message", "Must be uuid or url slug");
class ValidateIndex {}
exports.ValidateIndex = ValidateIndex;
_defineProperty(ValidateIndex, "regex", new RegExp("^[\x20-\x7E]+$"));
_defineProperty(ValidateIndex, "message", "Must be between x20 to x7E ASCII");
_defineProperty(ValidateIndex, "maxLength", 100);
class ValidateURL {}
exports.ValidateURL = ValidateURL;
_defineProperty(ValidateURL, "isValidMentionUrl", url => {
  if (!(0, _urls.isUrl)(url)) {
    return false;
  }
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "mention:") {
      return false;
    }
    const {
      id,
      mentionType,
      modelId
    } = (0, _parseMentionUrl.default)(url);
    return id && (0, _isUUID.default)(id) && Object.values(_types.MentionType).includes(mentionType) && (0, _isUUID.default)(modelId);
  } catch (err) {
    return false;
  }
});
_defineProperty(ValidateURL, "message", "Must be a valid url");
class ValidateColor {}
exports.ValidateColor = ValidateColor;
_defineProperty(ValidateColor, "regex", /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i);
_defineProperty(ValidateColor, "message", "Must be a hex value (please use format #FFFFFF)");