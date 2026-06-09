"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _tmp = _interopRequireDefault(require("tmp"));
var _yauzl = _interopRequireWildcard(require("yauzl"));
var _files = require("./../../shared/utils/files");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _tracing = require("./../logging/tracing");
var _fs = require("./fs");
var _dec, _class, _ZipHelper;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const MAX_FILE_NAME_LENGTH = 255;
const MAX_PATH_LENGTH = 4096;
let ZipHelper = exports.default = (_dec = (0, _tracing.trace)(), _dec(_class = (_ZipHelper = class ZipHelper {
  /**
   * Write a zip file to a temporary disk location
   *
   * @deprecated Use `extract` instead
   * @param zip JSZip object
   * @returns pathname of the temporary file where the zip was written to disk
   */
  static async toTmpFile(zip, options) {
    _Logger.default.debug("utils", "Creating tmp file…");
    return new Promise((resolve, reject) => {
      _tmp.default.file({
        prefix: "export-",
        postfix: ".zip"
      }, (err, path) => {
        if (err) {
          return reject(err);
        }
        let previousMetadata = {
          percent: 0,
          currentFile: null
        };
        const dest = _fsExtra.default.createWriteStream(path).on("finish", () => {
          _Logger.default.debug("utils", "Writing zip complete", {
            path
          });
          return resolve(path);
        }).on("error", reject);
        zip.generateNodeStream({
          ...this.defaultStreamOptions,
          ...options
        }, metadata => {
          if (metadata.currentFile !== previousMetadata.currentFile) {
            const percent = Math.round(metadata.percent);
            const memory = process.memoryUsage();
            previousMetadata = {
              currentFile: metadata.currentFile,
              percent
            };
            _Logger.default.debug("utils", `Writing zip file progress… ${percent}%`, {
              currentFile: metadata.currentFile,
              memory: (0, _files.bytesToHumanReadable)(memory.rss)
            });
          }
        }).on("error", rErr => {
          dest.end();
          reject(rErr);
        }).pipe(dest);
      });
    });
  }

  /**
   * Write a zip file to a disk location
   *
   * @param filePath The file path where the zip is located
   * @param outputDir The directory where the zip should be extracted
   */
  static extract(filePath, outputDir) {
    return new Promise((resolve, reject) => {
      _Logger.default.debug("utils", "Opening zip file", {
        filePath
      });
      _yauzl.default.open(filePath, {
        lazyEntries: true,
        autoClose: true,
        // Filenames are validated inside on("entry") handler instead of within yauzl as some
        // otherwise valid zip files (including those in our test suite) include / path. We can
        // safely read but skip writing these.
        // see: https://github.com/thejoshwolfe/yauzl/issues/135
        decodeStrings: false
      }, function (err, zipfile) {
        if (err) {
          return reject(err);
        }
        try {
          zipfile.readEntry();
          zipfile.on("entry", function (entry) {
            const fileName = Buffer.from(entry.fileName).toString("utf8");
            _Logger.default.debug("utils", "Extracting zip entry", {
              fileName
            });
            if ((0, _yauzl.validateFileName)(fileName)) {
              _Logger.default.warn("Invalid zip entry", {
                fileName
              });
              zipfile.readEntry();
            } else if (/\/$/.test(fileName)) {
              // directory file names end with '/'
              _fsExtra.default.mkdirp(_path.default.join(outputDir, fileName), function (mErr) {
                if (mErr) {
                  return reject(mErr);
                }
                zipfile.readEntry();
              });
            } else {
              // file entry
              zipfile.openReadStream(entry, function (rErr, readStream) {
                if (rErr) {
                  return reject(rErr);
                }
                // ensure parent directory exists
                _fsExtra.default.mkdirp(_path.default.join(outputDir, _path.default.dirname(fileName)), function (mkErr) {
                  if (mkErr) {
                    return reject(mkErr);
                  }
                  const location = (0, _fs.trimFileAndExt)(_path.default.join(outputDir, (0, _fs.trimFileAndExt)(fileName, MAX_FILE_NAME_LENGTH)), MAX_PATH_LENGTH);
                  const dest = _fsExtra.default.createWriteStream(location).on("error", reject);
                  readStream.on("error", rsErr => {
                    dest.end();
                    reject(rsErr);
                  }).on("end", function () {
                    zipfile.readEntry();
                  }).pipe(dest);
                });
              });
            }
          });
          zipfile.on("close", resolve);
          zipfile.on("error", reject);
        } catch (zErr) {
          reject(zErr);
        }
      });
    });
  }
}, _defineProperty(_ZipHelper, "defaultStreamOptions", {
  type: "nodebuffer",
  streamFiles: true,
  compression: "DEFLATE",
  compressionOptions: {
    level: 5
  }
}), _ZipHelper)) || _class);