"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _env = _interopRequireDefault(require("./../../../env"));
var _errors = require("./../../../errors");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _tasks = _interopRequireDefault(require("./../../../queues/tasks"));
var _crypto = require("./../../../utils/crypto");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const cronHandler = async ctx => {
  const token = ctx.input.body.token ?? ctx.input.query.token;
  const limit = ctx.input.body.limit ?? ctx.input.query.limit;
  if (!(0, _crypto.safeEqual)(_env.default.UTILS_SECRET, token)) {
    throw (0, _errors.AuthenticationError)("Invalid secret token");
  }
  for (const name in _tasks.default) {
    const TaskClass = _tasks.default[name];
    if (TaskClass.cron) {
      await TaskClass.schedule({
        limit
      });
    }
  }
  ctx.body = {
    success: true
  };
};
router.get("cron.:period", (0, _validate.default)(T.CronSchema), cronHandler);
router.post("cron.:period", (0, _validate.default)(T.CronSchema), cronHandler);

// For backwards compatibility
router.get("utils.gc", (0, _validate.default)(T.CronSchema), cronHandler);
router.post("utils.gc", (0, _validate.default)(T.CronSchema), cronHandler);
var _default = exports.default = router;