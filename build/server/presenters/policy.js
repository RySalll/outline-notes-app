"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compact = _interopRequireDefault(require("lodash/compact"));
var _tracing = require("./../logging/tracing");
var _policies = require("../policies");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentPolicy(user, models) {
  return (0, _compact.default)(models).map(model => ({
    id: model.id,
    abilities: (0, _policies.serialize)(user, model)
  }));
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "presenters"
})(presentPolicy);