"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.robotsResponse = void 0;
var _env = _interopRequireDefault(require("./../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const robotsResponse = () => {
  if (_env.default.isCloudHosted) {
    return `
User-agent: *
Allow: /
`;
  }
  return `
User-agent: *
Disallow: /
`;
};
exports.robotsResponse = robotsResponse;