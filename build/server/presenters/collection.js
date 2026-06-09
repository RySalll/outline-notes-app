"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentCollection;
var _DocumentHelper = require("./../models/helpers/DocumentHelper");
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function presentCollection(ctx, collection) {
  const asData = !ctx || Number(ctx?.headers["x-api-version"] ?? 0) >= 3;
  return {
    id: collection.id,
    url: collection.url,
    urlId: collection.urlId,
    name: collection.name,
    data: asData ? await _DocumentHelper.DocumentHelper.toJSON(collection) : undefined,
    description: asData ? undefined : collection.description,
    sort: collection.sort,
    icon: collection.icon,
    index: collection.index,
    color: collection.color,
    permission: collection.permission,
    sharing: collection.sharing,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    deletedAt: collection.deletedAt,
    archivedAt: collection.archivedAt,
    archivedBy: collection.archivedBy && (0, _user.default)(collection.archivedBy)
  };
}