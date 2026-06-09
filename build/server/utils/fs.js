"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deserializeFilename = deserializeFilename;
exports.getFilenamesInDirectory = getFilenamesInDirectory;
exports.requireDirectory = requireDirectory;
exports.serializeFilename = serializeFilename;
exports.stringByteLength = stringByteLength;
exports.trimFileAndExt = trimFileAndExt;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Serialize a file name for inclusion in a ZIP.
 *
 * @param text The file name to serialize.
 * @returns The serialized file name.
 */
function serializeFilename(text) {
  return text.replace(/\//g, "%2F").replace(/\\/g, "%5C");
}

/**
 * Deserialize a file name serialized with `serializeFilename`.
 *
 * @param text The file name to deserialize.
 * @returns The deserialized file name.
 */
function deserializeFilename(text) {
  return text.replace(/%2F/g, "/").replace(/%5C/g, "\\");
}

/**
 * Get the UTF8 byte length of a string.
 *
 * @param str The string to measure.
 * @returns The byte length of the string.
 */
function stringByteLength(str) {
  return Buffer.byteLength(str, "utf8");
}

/**
 * Trim a file name to a maximum length, retaining the extension.
 *
 * @param text The file name to trim.
 * @param length The maximum length of the file name.
 * @returns The trimmed file name.
 */
function trimFileAndExt(text, length) {
  if (stringByteLength(text) > length) {
    const ext = _path.default.extname(text);
    const name = _path.default.basename(text, ext);
    return name.slice(0, length - stringByteLength(ext)) + ext;
  }
  return text;
}

/**
 * Get a list of file names in a directory.
 *
 * @param dirName The directory to search.
 * @returns A list of file names in the directory.
 */
function getFilenamesInDirectory(dirName) {
  return _fsExtra.default.readdirSync(dirName).filter(file => file.indexOf(".") !== 0 && file.match(/\.[jt]s$/) && file !== _path.default.basename(__filename) && !file.includes(".test"));
}

/**
 * Require all files in a directory and return them as an array of tuples.
 *
 * @param dirName The directory to search.
 * @returns An array of tuples containing the required files and their names.
 */
function requireDirectory(dirName) {
  return getFilenamesInDirectory(dirName).map(fileName => {
    const filePath = _path.default.join(dirName, fileName);
    const name = _path.default.basename(filePath.replace(/\.[jt]s$/, ""));
    return [require(filePath), name];
  });
}