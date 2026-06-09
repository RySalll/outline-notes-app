"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitHub = void 0;
var _authApp = require("@octokit/auth-app");
var _octokit = require("octokit");
var _pluralize = _interopRequireDefault(require("pluralize"));
var _types = require("./../../../shared/types");
var _Logger = _interopRequireDefault(require("./../../../server/logging/Logger"));
var _models = require("./../../../server/models");
var _env = _interopRequireDefault(require("./env"));
var _GitHub;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const requestPlugin = octokit => ({
  requestPR: async params => octokit.request(`GET /repos/{owner}/{repo}/pulls/{id}`, {
    owner: params?.owner,
    repo: params?.repo,
    id: params?.id,
    headers: {
      Accept: "application/vnd.github.text+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }),
  requestIssue: async params => octokit.request(`GET /repos/{owner}/{repo}/issues/{id}`, {
    owner: params?.owner,
    repo: params?.repo,
    id: params?.id,
    headers: {
      Accept: "application/vnd.github.text+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }),
  /**
   * Fetches app installations accessible to the user
   *
   * @returns {Array} Containing details of all app installations done by user
   */
  requestAppInstallations: async () => octokit.paginate("GET /user/installations"),
  /**
   * Fetches details of a GitHub resource, e.g, a pull request or an issue
   *
   * @param resource Contains identifiers which are used to construct resource endpoint, e.g, `/repos/{params.owner}/{params.repo}/pulls/{params.id}`
   * @returns Response containing resource details
   */
  requestResource: async function requestResource(resource) {
    switch (resource?.type) {
      case _types.UnfurlResourceType.PR:
        return this.requestPR(resource);
      case _types.UnfurlResourceType.Issue:
        return this.requestIssue(resource);
      default:
        return {
          data: undefined
        };
    }
  },
  /**
   * Uninstalls the GitHub app from a given target
   *
   * @param installationId Id of the target from where to uninstall
   */
  requestAppUninstall: async installationId => octokit.request("DELETE /app/installations/{id}", {
    id: installationId
  })
});
const CustomOctokit = _octokit.Octokit.plugin(requestPlugin);
class GitHub {
  /**
   * Parses a given URL and returns resource identifiers for GitHub specific URLs
   *
   * @param url URL to parse
   * @returns {object} Containing resource identifiers - `owner`, `repo`, `type` and `id`.
   */
  static parseUrl(url) {
    const {
      hostname,
      pathname
    } = new URL(url);
    if (hostname !== "github.com") {
      return;
    }
    const parts = pathname.split("/");
    const owner = parts[1];
    const repo = parts[2];
    const type = parts[3] ? _pluralize.default.singular(parts[3]) : undefined;
    const id = parts[4];
    if (!type || !GitHub.supportedResources.includes(type)) {
      return;
    }
    return {
      owner,
      repo,
      type,
      id,
      url
    };
  }
}
exports.GitHub = GitHub;
_GitHub = GitHub;
_defineProperty(GitHub, "appId", _env.default.GITHUB_APP_ID);
_defineProperty(GitHub, "appKey", _env.default.GITHUB_APP_PRIVATE_KEY ? Buffer.from(_env.default.GITHUB_APP_PRIVATE_KEY, "base64").toString("ascii") : undefined);
_defineProperty(GitHub, "clientId", _env.default.GITHUB_CLIENT_ID);
_defineProperty(GitHub, "clientSecret", _env.default.GITHUB_CLIENT_SECRET);
_defineProperty(GitHub, "appOctokit", void 0);
_defineProperty(GitHub, "supportedResources", Object.values(_types.UnfurlResourceType));
_defineProperty(GitHub, "authenticateAsApp", () => {
  if (!_GitHub.appOctokit) {
    _GitHub.appOctokit = new CustomOctokit({
      authStrategy: _authApp.createAppAuth,
      auth: {
        appId: _GitHub.appId,
        privateKey: _GitHub.appKey,
        clientId: _GitHub.clientId,
        clientSecret: _GitHub.clientSecret
      }
    });
  }
  return _GitHub.appOctokit;
});
/**
 * [Authenticates as a GitHub user](https://github.com/octokit/auth-app.js/?tab=readme-ov-file#authenticate-as-installation)
 *
 * @param code Temporary code received in callback url after user authorizes
 * @param state A string received in callback url to protect against CSRF
 * @returns {Octokit} User-authenticated octokit instance
 */
_defineProperty(GitHub, "authenticateAsUser", async (code, state) => _GitHub.authenticateAsApp().auth({
  type: "oauth-user",
  code,
  state,
  factory: options => new CustomOctokit({
    authStrategy: _authApp.createOAuthUserAuth,
    auth: options
  })
}));
/**
 * [Authenticates as a GitHub app installation](https://github.com/octokit/auth-app.js/?tab=readme-ov-file#authenticate-as-installation)
 *
 * @param installationId Id of an installation
 * @returns {Octokit} Installation-authenticated octokit instance
 */
_defineProperty(GitHub, "authenticateAsInstallation", async installationId => _GitHub.authenticateAsApp().auth({
  type: "installation",
  installationId,
  factory: options => new CustomOctokit({
    authStrategy: _authApp.createAppAuth,
    auth: options
  })
}));
/**
 *
 * @param url GitHub resource url
 * @param actor User attempting to unfurl resource url
 * @returns An object containing resource details e.g, a GitHub Pull Request details
 */
_defineProperty(GitHub, "unfurl", async (url, actor) => {
  const resource = _GitHub.parseUrl(url);
  if (!resource) {
    return;
  }
  const integration = await _models.Integration.findOne({
    where: {
      service: _types.IntegrationService.GitHub,
      teamId: actor.teamId,
      "settings.github.installation.account.name": resource.owner
    }
  });
  if (!integration) {
    return;
  }
  try {
    const client = await _GitHub.authenticateAsInstallation(integration.settings.github.installation.id);
    const {
      data
    } = await client.requestResource(resource);
    if (!data) {
      return;
    }
    return {
      ...data,
      type: resource.type
    };
  } catch (err) {
    _Logger.default.warn("Failed to fetch resource from GitHub", err);
    return;
  }
});