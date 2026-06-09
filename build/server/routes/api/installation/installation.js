"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _getInstallationInfo = require("./../../../utils/getInstallationInfo");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("installation.info", (0, _authentication.default)(), async ctx => {
  const currentVersion = (0, _getInstallationInfo.getVersion)();
  const {
    latestVersion,
    versionsBehind
  } = await (0, _getInstallationInfo.getVersionInfo)(currentVersion);
  ctx.body = {
    data: {
      version: currentVersion,
      latestVersion,
      versionsBehind
    },
    policies: []
  };
});
var _default = exports.default = router;