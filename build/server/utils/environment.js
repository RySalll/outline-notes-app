"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let environment = {};
const envPath = _path.default.resolve(process.cwd(), `.env`);
const envDefault = _fs.default.existsSync(envPath) ? _dotenv.default.parse(_fs.default.readFileSync(envPath, "utf8")) : {};

// Load environment specific variables, in reverse order of precedence
const environments = ["production", "development", "local", "test"];
for (const env of environments) {
  const isEnv = process.env.NODE_ENV === env || envDefault.NODE_ENV === env;
  const isLocalDevelopment = env === "local" && (process.env.NODE_ENV === "development" || envDefault.NODE_ENV === "development");
  if (isEnv || isLocalDevelopment) {
    const resolvedPath = _path.default.resolve(process.cwd(), `.env.${env}`);
    if (_fs.default.existsSync(resolvedPath)) {
      environment = {
        ...environment,
        ..._dotenv.default.parse(_fs.default.readFileSync(resolvedPath, "utf8"))
      };
    }
  }
}
process.env = {
  ...envDefault,
  ...environment,
  ...process.env
};
var _default = exports.default = process.env;