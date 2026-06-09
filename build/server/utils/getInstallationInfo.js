"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVersion = getVersion;
exports.getVersionInfo = getVersionInfo;
var _package = require("../../package.json");
var _fetch = _interopRequireDefault(require("./fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const dockerhubLink = "https://hub.docker.com/v2/repositories/outlinewiki/outline";
function isFullReleaseVersion(versionName) {
  const releaseRegex = /^(version-)?\d+\.\d+\.\d+$/; // Matches "N.N.N" or "version-N.N.N" for dockerhub releases before v0.56.0"
  return releaseRegex.test(versionName);
}
async function getVersionInfo(currentVersion) {
  let allVersions = [];
  let latestVersion = null;
  let nextUrl = dockerhubLink + "/tags?name=&ordering=last_updated&page_size=100";

  // Continue fetching pages until the required versions are found or no more pages
  while (nextUrl) {
    const response = await (0, _fetch.default)(nextUrl);
    const data = await response.json();

    // Map and filter the versions to keep only full releases
    const pageVersions = data.results.map(result => result.name).filter(isFullReleaseVersion);
    allVersions = allVersions.concat(pageVersions);

    // Set the latest version if not already set
    if (!latestVersion && pageVersions.length > 0) {
      latestVersion = pageVersions[0];
    }

    // Check if the current version is found
    const currentIndex = allVersions.findIndex(version => version === currentVersion);
    if (currentIndex !== -1) {
      const versionsBehind = currentIndex; // The number of versions behind
      return {
        latestVersion: latestVersion || currentVersion,
        // Fallback to current if no latest found
        versionsBehind
      };
    }
    nextUrl = data.next || null;
  }
  return {
    latestVersion: latestVersion || currentVersion,
    versionsBehind: -1 // Return -1 if current version is not found
  };
}
function getVersion() {
  return _package.version;
}