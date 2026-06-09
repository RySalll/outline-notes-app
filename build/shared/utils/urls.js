"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cdnPath = cdnPath;
exports.creatingUrlPrefix = void 0;
exports.fileNameFromUrl = fileNameFromUrl;
exports.getUrls = getUrls;
exports.isBase64Url = isBase64Url;
exports.isDocumentUrl = isDocumentUrl;
exports.isExternalUrl = isExternalUrl;
exports.isInternalUrl = isInternalUrl;
exports.isUrl = isUrl;
exports.sanitizeUrl = sanitizeUrl;
exports.urlRegex = urlRegex;
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _env = _interopRequireDefault(require("../env"));
var _browser = require("./browser");
var _domains = require("./domains");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Prepends the CDN url to the given path (If a CDN is configured).
 *
 * @param path The path to prepend the CDN url to.
 * @returns The path with the CDN url prepended.
 */
function cdnPath(path) {
  return `${_env.default.CDN_URL ?? ""}${path}`;
}

/**
 * Extracts the file name from a given url.
 *
 * @param url The url to extract the file name from.
 * @returns The file name.
 */
function fileNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").pop();
  } catch (err) {
    return;
  }
}

/**
 * Returns true if the given string is a link to inside the application.
 *
 * @param url The url to check.
 * @returns True if the url is internal, false otherwise.
 */
function isInternalUrl(href) {
  // empty strings are never internal
  if (href === "") {
    return false;
  }

  // relative paths are always internal
  if (href[0] === "/") {
    return true;
  }
  const outline = _browser.isBrowser ? (0, _domains.parseDomain)(window.location.href) : (0, _domains.parseDomain)(_env.default.URL);
  const domain = (0, _domains.parseDomain)(href);
  return outline.host === domain.host && outline.port === domain.port || _browser.isBrowser && window.location.hostname === domain.host && window.location.port === domain.port;
}

/**
 * Returns true if the given string is a link to a documement.
 *
 * @param options Parsing options.
 * @returns True if a document, false otherwise.
 */
function isDocumentUrl(url) {
  try {
    const parsed = new URL(url, _env.default.URL);
    return isInternalUrl(url) && (parsed.pathname.startsWith("/doc/") || parsed.pathname.startsWith("/d/"));
  } catch (err) {
    return false;
  }
}

/**
 * Returns true if the given string is a url.
 *
 * @param text The url to check.
 * @param options Parsing options.
 * @returns True if a url, false otherwise.
 */
function isUrl(text, options) {
  if (text.match(/\n/)) {
    return false;
  }
  try {
    const url = new URL(text);
    const blockedProtocols = ["javascript:", "file:", "vbscript:", "data:"];
    if (blockedProtocols.includes(url.protocol)) {
      return false;
    }
    if (url.hostname) {
      return true;
    }
    return url.protocol !== "" && (url.pathname.startsWith("//") || url.pathname.startsWith("http")) && !options?.requireHostname;
  } catch (err) {
    return false;
  }
}

/**
 * Temporary prefix applied to links in document that are not yet persisted.
 */
const creatingUrlPrefix = exports.creatingUrlPrefix = "creating#";

/**
 * Returns true if the given string is a link to outside the application.
 *
 * @param url The url to check.
 * @returns True if the url is external, false otherwise.
 */
function isExternalUrl(url) {
  return !!url && !isInternalUrl(url) && !url.startsWith(creatingUrlPrefix) && (!_env.default.CDN_URL || !url.startsWith(_env.default.CDN_URL));
}

/**
 * Returns match if the given string is a base64 encoded url.
 *
 * @param url The url to check.
 * @returns A RegExp match if the url is base64, false otherwise.
 */
function isBase64Url(url) {
  const match = url.match(/^data:([a-z]+\/[^;]+);base64,(.*)/i);
  return match ? match : false;
}

/**
 * For use in the editor, this function will ensure that a url is
 * potentially valid, and filter out unsupported and malicious protocols.
 *
 * @param url The url to sanitize
 * @returns The sanitized href
 */
function sanitizeUrl(url) {
  if (!url) {
    return undefined;
  }
  if (!isUrl(url, {
    requireHostname: false
  }) && !url.startsWith("/") && !url.startsWith("#") && !url.startsWith("mailto:") && !url.startsWith("sms:") && !url.startsWith("fax:") && !url.startsWith("tel:")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Returns a regex to match the given url.
 *
 * @param url The url to create a regex for.
 * @returns A regex to match the url.
 */
function urlRegex(url) {
  if (!url || !isUrl(url)) {
    return undefined;
  }
  const urlObj = new URL(sanitizeUrl(url));
  return new RegExp((0, _escapeRegExp.default)(`${urlObj.protocol}//${urlObj.host}`));
}

/**
 * Extracts LIKELY urls from the given text, note this does not validate the urls.
 *
 * @param text The text to extract urls from.
 * @returns An array of likely urls.
 */
function getUrls(text) {
  return Array.from(text.match(/(?:https?):\/\/[^\s]+/gi) || []);
}