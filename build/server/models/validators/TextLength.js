"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TextLength;
var _size = _interopRequireDefault(require("lodash/size"));
var _prosemirrorModel = require("prosemirror-model");
var _sequelizeTypescript = require("sequelize-typescript");
var _ProsemirrorHelper = require("./../../../shared/utils/ProsemirrorHelper");
var _editor = require("./../../editor");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A decorator that validates the size of the text within a prosemirror data
 * object, taking into account unicode characters of variable lengths.
 */
function TextLength(_ref) {
  let {
    msg,
    min = 0,
    max
  } = _ref;
  return (target, propertyName) => (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validLength(value) {
        let text;
        try {
          text = _ProsemirrorHelper.ProsemirrorHelper.toPlainText(_prosemirrorModel.Node.fromJSON(_editor.schema, value), _editor.schema);
        } catch (err) {
          throw new Error("Invalid data");
        }
        if ((0, _size.default)(text) > max || (0, _size.default)(text) < min) {
          throw new Error(msg);
        }
      }
    }
  });
}