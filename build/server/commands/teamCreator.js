"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _slugify = _interopRequireDefault(require("slugify"));
var _domains = require("./../../shared/utils/domains");
var _tracing = require("./../logging/tracing");
var _models = require("./../models");
var _avatars = require("./../utils/avatars");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function teamCreator(_ref) {
  let {
    name,
    domain,
    subdomain,
    avatarUrl,
    authenticationProviders,
    ip,
    transaction
  } = _ref;
  // If the service did not provide a logo/avatar then we attempt to generate
  // one via ClearBit, or fallback to colored initials in worst case scenario
  if (!avatarUrl || !avatarUrl.startsWith("http")) {
    avatarUrl = await (0, _avatars.generateAvatarUrl)({
      domain,
      id: subdomain
    });
  }
  const team = await _models.Team.create({
    name,
    avatarUrl,
    authenticationProviders
  }, {
    include: ["authenticationProviders"],
    transaction
  });
  await _models.Event.create({
    name: "teams.create",
    teamId: team.id,
    ip
  }, {
    transaction
  });
  const availableSubdomain = await findAvailableSubdomain(team, subdomain);
  await team.update({
    subdomain: availableSubdomain
  }, {
    transaction
  });
  return team;
}
async function findAvailableSubdomain(team, requestedSubdomain) {
  // filter subdomain to only valid characters
  // if there are less than the minimum length, use a default subdomain
  const normalizedSubdomain = (0, _slugify.default)(requestedSubdomain, {
    lower: true,
    strict: true
  });
  let subdomain = normalizedSubdomain.length < 3 || _domains.RESERVED_SUBDOMAINS.includes(normalizedSubdomain) ? "team" : normalizedSubdomain;
  let append = 0;
  for (;;) {
    const existing = await _models.Team.findOne({
      where: {
        subdomain
      },
      paranoid: false
    });
    if (existing) {
      // subdomain was invalid or already used, try another
      subdomain = `${normalizedSubdomain}${++append}`;
    } else {
      break;
    }
  }
  return subdomain;
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "teamCreator"
})(teamCreator);