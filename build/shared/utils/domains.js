"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RESERVED_SUBDOMAINS = void 0;
exports.getBaseDomain = getBaseDomain;
exports.getCookieDomain = getCookieDomain;
exports.parseDomain = parseDomain;
exports.slugifyDomain = slugifyDomain;
var _trim = _interopRequireDefault(require("lodash/trim"));
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Removes the the top level domain from the argument and slugifies it
 *
 * @param domain Domain string to slugify
 * @returns String with only non top-level domains
 */
function slugifyDomain(domain) {
  return domain.split(".").slice(0, -1).join("-");
}

// strips protocol and whitespace from input
// then strips the path and query string
function normalizeUrl(url) {
  return (0, _trim.default)(url.replace(/(https?:)?\/\//, "")).split(/[/:?]/)[0];
}

// The base domain is where root cookies are set in hosted mode
// It's also appended to a team's hosted subdomain to form their app URL
function getBaseDomain() {
  const normalEnvUrl = normalizeUrl(_env.default.URL);
  const tokens = normalEnvUrl.split(".");

  // remove reserved subdomains like "app"
  // from the env URL to form the base domain
  return tokens.length > 1 && RESERVED_SUBDOMAINS.includes(tokens[0]) ? tokens.slice(1).join(".") : normalEnvUrl;
}

// we originally used the parse-domain npm module however this includes
// a large list of possible TLD's which increase the size of the bundle
// unnecessarily for our usecase of trusted input.
function parseDomain(url) {
  if (!url) {
    throw new TypeError("a non-empty url is required");
  }
  let port;
  try {
    const parsedUrl = new URL(url);
    port = parsedUrl.port || undefined;
  } catch (e) {
    // ignore
  }
  const host = normalizeUrl(url);
  const baseDomain = getBaseDomain();

  // if the url doesn't include the base url, then it must be a custom domain
  const baseUrlStart = host === baseDomain ? 0 : host.indexOf(`.${baseDomain}`);
  if (baseUrlStart === -1) {
    return {
      teamSubdomain: "",
      host,
      port: undefined,
      custom: true
    };
  }

  // we consider anything in front of the baseUrl to be the subdomain
  const subdomain = host.substring(0, baseUrlStart);
  const isReservedSubdomain = RESERVED_SUBDOMAINS.includes(subdomain);
  return {
    teamSubdomain: isReservedSubdomain ? "" : subdomain,
    host,
    port,
    custom: false
  };
}
function getCookieDomain(domain, isCloudHosted) {
  // always use the base URL for cookies when in hosted mode
  // and the domain is not custom
  if (isCloudHosted) {
    const parsed = parseDomain(domain);
    if (!parsed.custom) {
      return getBaseDomain();
    }
  }
  return domain;
}
const RESERVED_SUBDOMAINS = exports.RESERVED_SUBDOMAINS = ["about", "account", "admin", "advertising", "api", "app", "assets", "archive", "beta", "billing", "blog", "cache", "cdn", "code", "community", "dashboard", "developer", "developers", "forum", "help", "home", "http", "https", "imap", "localhost", "mail", "marketing", "mobile", "multiplayer", "new", "news", "newsletter", "ns1", "ns2", "ns3", "ns4", "password", "profile", "realtime", "sandbox", "script", "scripts", "setup", "signin", "signup", "site", "smtp", "support", "status", "static", "stats", "test", "update", "updates", "ws", "wss", "web", "websockets", "www", "www1", "www2", "www3", "www4"];