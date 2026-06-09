"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _authentication = _interopRequireDefault(require("./../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("./../../../middlewares/validate"));
var _models = require("./../../../models");
var _SearchHelper = _interopRequireDefault(require("./../../../models/helpers/SearchHelper"));
var _policies = require("./../../../policies");
var _presenters = require("./../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("suggestions.mention", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.SuggestionsListSchema), async ctx => {
  const {
    query
  } = ctx.input.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const actor = ctx.state.auth.user;
  const [documents, users] = await Promise.all([_SearchHelper.default.searchTitlesForUser(actor, {
    query,
    offset,
    limit
  }), _models.User.findAll({
    where: {
      teamId: actor.teamId,
      suspendedAt: {
        [_sequelize.Op.eq]: null
      },
      [_sequelize.Op.and]: query ? {
        [_sequelize.Op.or]: [_sequelizeTypescript.Sequelize.literal(`unaccent(LOWER(email)) like unaccent(LOWER(:query))`), _sequelizeTypescript.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`)]
      } : {}
    },
    order: [["name", "ASC"]],
    replacements: {
      query: `%${query}%`
    },
    offset,
    limit
  })]);
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      documents: await Promise.all(documents.map(document => (0, _presenters.presentDocument)(ctx, document))),
      users: users.map(user => (0, _presenters.presentUser)(user, {
        includeEmail: !!(0, _policies.can)(actor, "readEmail", user),
        includeDetails: !!(0, _policies.can)(actor, "readDetails", user)
      }))
    }
  };
});
var _default = exports.default = router;