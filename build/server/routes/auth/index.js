"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));
var _dateFns = require("date-fns");
var _koa = _interopRequireDefault(require("koa"));
var _koaBody = _interopRequireDefault(require("koa-body"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _errors = require("./../../errors");
var _authentication = _interopRequireDefault(require("./../../middlewares/authentication"));
var _coaleseBody = _interopRequireDefault(require("./../../middlewares/coaleseBody"));
var _models = require("./../../models");
var _AuthenticationHelper = _interopRequireDefault(require("./../../models/helpers/AuthenticationHelper"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = new _koa.default();
const router = new _koaRouter.default();
router.use(_koaPassport.default.initialize());

// dynamically load available authentication provider routes
_AuthenticationHelper.default.providers.forEach(provider => {
  router.use("/", provider.value.router.routes());
});
router.get("/redirect", (0, _authentication.default)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const jwtToken = user.getJwtToken();
  if (jwtToken === ctx.params.token) {
    throw (0, _errors.AuthenticationError)("Cannot extend token");
  }

  // ensure that the lastActiveAt on user is updated to prevent replay requests
  await user.updateActiveAt(ctx, true);
  ctx.cookies.set("accessToken", jwtToken, {
    sameSite: "lax",
    expires: (0, _dateFns.addMonths)(new Date(), 3)
  });
  const [team, collection, view] = await Promise.all([_models.Team.findByPk(user.teamId), _models.Collection.findFirstCollectionForUser(user), _models.View.findOne({
    where: {
      userId: user.id
    }
  })]);
  const defaultCollectionId = team?.defaultCollectionId;
  if (defaultCollectionId) {
    const collection = await _models.Collection.findOne({
      where: {
        id: defaultCollectionId,
        teamId: team.id
      }
    });
    if (collection) {
      ctx.redirect(`${team.url}${collection.url}`);
      return;
    }
  }
  const hasViewedDocuments = !!view;
  ctx.redirect(!hasViewedDocuments && collection ? `${team?.url}${collection.url}` : `${team?.url}/home`);
});
app.use((0, _koaBody.default)());
app.use((0, _coaleseBody.default)());
app.use(router.routes());
var _default = exports.default = app;