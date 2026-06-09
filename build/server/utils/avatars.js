"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateAvatarUrl = generateAvatarUrl;
var _crypto = _interopRequireDefault(require("crypto"));
var _fetch = _interopRequireDefault(require("./fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function generateAvatarUrl(_ref) {
  let {
    id,
    domain
  } = _ref;
  // attempt to get logo from Clearbit API. If one doesn't exist then
  // fall back to using tiley to generate a placeholder logo
  const hash = _crypto.default.createHash("sha256");
  hash.update(id);
  let cbResponse, cbUrl;
  if (domain) {
    cbUrl = `https://logo.clearbit.com/${domain}`;
    try {
      cbResponse = await (0, _fetch.default)(cbUrl);
    } catch (err) {
      // okay
    }
  }
  return cbUrl && cbResponse && cbResponse.status === 200 ? cbUrl : null;
}