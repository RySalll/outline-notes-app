"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _randomstring = _interopRequireDefault(require("randomstring"));
var _userInviter = _interopRequireDefault(require("./../../../commands/userInviter"));
var _env = _interopRequireDefault(require("./../../../env"));
var _Logger = _interopRequireDefault(require("./../../../logging/Logger"));
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _presenters = require("./../../../presenters");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
function dev() {
  return async function checkDevelopmentMiddleware(ctx, next) {
    if (_env.default.ENVIRONMENT !== "development") {
      throw new Error("Attempted to access development route in production");
    }
    return next();
  };
}
router.post("developer.create_test_users", dev(), (0, _authentication.default)(), (0, _validate.default)(T.CreateTestUsersSchema), async ctx => {
  const {
    count = 10
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const invites = Array(Math.min(count, 100)).fill(0).map(() => {
    const rando = _randomstring.default.generate(10);
    return {
      email: `${rando}@example.com`,
      name: `${rando.slice(0, 5)} Tester`,
      role: "member"
    };
  });
  _Logger.default.info("utils", `Creating ${count} test users`, invites);

  // Generate a bunch of invites
  const response = await (0, _userInviter.default)({
    user,
    invites,
    ip: ctx.request.ip
  });

  // Convert from invites to active users by marking as active
  await Promise.all(response.users.map(user => user.updateActiveAt(ctx, true)));
  ctx.body = {
    data: {
      users: response.users.map(user => (0, _presenters.presentUser)(user))
    }
  };
});
var _default = exports.default = router;