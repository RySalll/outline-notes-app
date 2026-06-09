"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Buckets = void 0;
var _dateFns = require("date-fns");
var _types = require("./../../../shared/types");
var _env = _interopRequireDefault(require("./../../env"));
var _validation = require("./../../validation");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Buckets = exports.Buckets = /*#__PURE__*/function (Buckets) {
  Buckets["public"] = "public";
  Buckets["uploads"] = "uploads";
  Buckets["avatars"] = "avatars";
  return Buckets;
}({});
class AttachmentHelper {
  /**
   * Get the upload location for the given upload details
   *
   * @param acl The ACL to use
   * @param id The ID of the attachment
   * @param name The name of the attachment
   * @param userId The ID of the user uploading the attachment
   */
  static getKey(_ref) {
    let {
      acl,
      id,
      name,
      userId
    } = _ref;
    const bucket = acl === "public-read" ? Buckets.public : Buckets.uploads;
    const keyPrefix = `${bucket}/${userId}/${id}`;
    return _validation.ValidateKey.sanitize(`${keyPrefix}/${name.slice(0, this.maximumFileNameLength)}`);
  }

  /**
   * Parse a key into its constituent parts
   *
   * @param key The key to parse
   * @returns The constituent parts
   */
  static parseKey(key) {
    const parts = key.split("/");
    const bucket = parts[0];
    const userId = parts[1];
    const id = parts[2];
    const [fileName] = parts.length > 3 ? parts.slice(-1) : [];
    return {
      bucket,
      userId,
      id,
      fileName,
      isPublicBucket: bucket === Buckets.avatars || bucket === Buckets.public
    };
  }

  /**
   * Get the ACL to use for a given attachment preset
   *
   * @param preset The preset to use
   * @returns A valid S3 ACL
   */
  static presetToAcl(preset) {
    switch (preset) {
      case _types.AttachmentPreset.Avatar:
        return "public-read";
      default:
        return _env.default.AWS_S3_ACL;
    }
  }

  /**
   * Get the expiration time for a given attachment preset
   *
   * @param preset The preset to use
   * @returns An expiration time
   */
  static presetToExpiry(preset) {
    switch (preset) {
      case _types.AttachmentPreset.Import:
      case _types.AttachmentPreset.WorkspaceImport:
        return (0, _dateFns.addHours)(new Date(), 24);
      default:
        return undefined;
    }
  }

  /**
   * Get the maximum upload size for a given attachment preset
   *
   * @param preset The preset to use
   * @returns The maximum upload size in bytes
   */
  static presetToMaxUploadSize(preset) {
    switch (preset) {
      case _types.AttachmentPreset.Import:
        return _env.default.FILE_STORAGE_IMPORT_MAX_SIZE;
      case _types.AttachmentPreset.WorkspaceImport:
        return _env.default.FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE;
      case _types.AttachmentPreset.Avatar:
      case _types.AttachmentPreset.DocumentAttachment:
      default:
        return _env.default.FILE_STORAGE_UPLOAD_MAX_SIZE;
    }
  }
}
exports.default = AttachmentHelper;
_defineProperty(AttachmentHelper, "maximumFileNameLength", 255);