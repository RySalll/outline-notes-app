"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _documentPermanentDeleter = _interopRequireDefault(require("./../../commands/documentPermanentDeleter"));
var _models = require("./../../models");
var _BaseTask = _interopRequireDefault(require("./BaseTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class EmptyTrashTask extends _BaseTask.default {
  async perform(_ref) {
    let {
      documentIds
    } = _ref;
    if (!documentIds.length) {
      return;
    }
    const documents = await _models.Document.unscoped().findAll({
      where: {
        id: {
          [_sequelize.Op.in]: documentIds
        },
        // for safety, ensure the documents are in soft-delete state.
        deletedAt: {
          [_sequelize.Op.ne]: null
        }
      },
      paranoid: false
    });
    await (0, _documentPermanentDeleter.default)(documents);
  }
}
exports.default = EmptyTrashTask;