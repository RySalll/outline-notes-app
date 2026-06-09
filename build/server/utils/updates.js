"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkUpdates = checkUpdates;
var _crypto = _interopRequireDefault(require("crypto"));
var _env = _interopRequireDefault(require("./../env"));
var _Collection = _interopRequireDefault(require("./../models/Collection"));
var _Document = _interopRequireDefault(require("./../models/Document"));
var _Team = _interopRequireDefault(require("./../models/Team"));
var _User = _interopRequireDefault(require("./../models/User"));
var _redis = _interopRequireDefault(require("./../storage/redis"));
var _package = _interopRequireDefault(require("../../package.json"));
var _fetch = _interopRequireDefault(require("./fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const UPDATES_URL = "https://updates.getoutline.com";
const UPDATES_KEY = "UPDATES_KEY";
async function checkUpdates() {
  const secret = _env.default.SECRET_KEY.slice(0, 6) + _env.default.URL;
  const id = _crypto.default.createHash("sha256").update(secret).digest("hex");
  const [userCount, teamCount, collectionCount, documentCount] = await Promise.all([_User.default.count(), _Team.default.count(), _Collection.default.count(), _Document.default.count()]);
  const body = JSON.stringify({
    id,
    version: 1,
    clientVersion: _package.default.version,
    analytics: {
      userCount,
      teamCount,
      collectionCount,
      documentCount
    }
  });
  await _redis.default.defaultClient.del(UPDATES_KEY);
  try {
    const response = await (0, _fetch.default)(UPDATES_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body
    });
    const data = await response.json();
    if (data.severity) {
      await _redis.default.defaultClient.set(UPDATES_KEY, JSON.stringify({
        severity: data.severity,
        message: data.message,
        url: data.url
      }));
    }
  } catch (_e) {
    // no-op
  }
}