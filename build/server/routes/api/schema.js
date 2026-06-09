"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProsemirrorSchema = exports.BaseSchema = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _zod = require("zod");
var _ProsemirrorHelper = require("./../../../shared/utils/ProsemirrorHelper");
var _editor = require("./../../editor");
const BaseSchema = exports.BaseSchema = _zod.z.object({
  body: _zod.z.unknown(),
  query: _zod.z.unknown(),
  file: _zod.z.custom().optional()
});

/**
 * Returns a Zod schema for validating a Prosemirror document.
 *
 * @param allowEmpty - Whether to allow an empty document.
 */
const ProsemirrorSchema = options => _zod.z.custom(val => {
  try {
    const node = _prosemirrorModel.Node.fromJSON(_editor.schema, val);
    node.check();
    return options?.allowEmpty ? true : !_ProsemirrorHelper.ProsemirrorHelper.isEmpty(node, _editor.schema);
  } catch (_e) {
    return false;
  }
}, "Invalid data");
exports.ProsemirrorSchema = ProsemirrorSchema;