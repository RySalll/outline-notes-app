"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SetupAction = exports.GitHubCallbackSchema = void 0;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _zod = require("zod");
var _schema = require("./../../../../server/routes/api/schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let SetupAction = exports.SetupAction = /*#__PURE__*/function (SetupAction) {
  SetupAction["install"] = "install";
  SetupAction["request"] = "request";
  return SetupAction;
}({});
const GitHubCallbackSchema = exports.GitHubCallbackSchema = _schema.BaseSchema.extend({
  query: _zod.z.object({
    code: _zod.z.string().nullish(),
    state: _zod.z.string().uuid().nullish(),
    error: _zod.z.string().nullish(),
    installation_id: _zod.z.coerce.number().optional(),
    setup_action: _zod.z.nativeEnum(SetupAction)
  }).refine(req => !((0, _isEmpty.default)(req.code) && (0, _isEmpty.default)(req.error)), {
    message: "one of code or error is required"
  }).refine(req => !(req.setup_action === SetupAction.install && (0, _isUndefined.default)(req.installation_id)), {
    message: "installation_id is required for installation"
  })
});