"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("./../../../../shared/types");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _transaction = require("./../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _AuthenticationHelper = _interopRequireDefault(require("./../../../models/helpers/AuthenticationHelper"));
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("authenticationProviders.info", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.AuthenticationProvidersInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(id);
  (0, _policies.authorize)(user, "read", authenticationProvider);
  ctx.body = {
    data: (0, _presenters.presentAuthenticationProvider)(authenticationProvider),
    policies: (0, _presenters.presentPolicies)(user, [authenticationProvider])
  };
});
router.post("authenticationProviders.update", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.AuthenticationProvidersUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    isEnabled
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "update", authenticationProvider);
  const enabled = !!isEnabled;
  if (enabled) {
    await authenticationProvider.enable({
      transaction
    });
  } else {
    await authenticationProvider.disable({
      transaction
    });
  }
  await _models.Event.createFromContext(ctx, {
    name: "authenticationProviders.update",
    data: {
      enabled
    },
    modelId: id
  });
  ctx.body = {
    data: (0, _presenters.presentAuthenticationProvider)(authenticationProvider),
    policies: (0, _presenters.presentPolicies)(user, [authenticationProvider])
  };
});
router.post("authenticationProviders.list", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), async ctx => {
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "read", user.team);
  const teamAuthenticationProviders = await user.team.$get("authenticationProviders");
  const data = _AuthenticationHelper.default.providers.filter(p => p.value.id !== "email").map(p => {
    const row = teamAuthenticationProviders.find(t => t.name === p.value.id);
    return {
      id: p.value.id,
      name: p.value.id,
      displayName: p.name,
      isEnabled: false,
      isConnected: false,
      ...(row ? (0, _presenters.presentAuthenticationProvider)(row) : {})
    };
  }).sort(a => a.isEnabled ? -1 : 1);
  ctx.body = {
    data
  };
});
var _default = exports.default = router;