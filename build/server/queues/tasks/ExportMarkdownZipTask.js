"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _jszip = _interopRequireDefault(require("jszip"));
var _types = require("./../../../shared/types");
var _ExportDocumentTreeTask = _interopRequireDefault(require("./ExportDocumentTreeTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ExportMarkdownZipTask extends _ExportDocumentTreeTask.default {
  async export(collections, fileOperation) {
    const zip = new _jszip.default();
    return await this.addCollectionsToArchive(zip, collections, _types.FileOperationFormat.MarkdownZip, fileOperation.options?.includeAttachments);
  }
}
exports.default = ExportMarkdownZipTask;