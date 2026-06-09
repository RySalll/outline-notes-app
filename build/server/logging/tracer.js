"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTags = addTags;
exports.default = void 0;
exports.getRootSpanFromRequestContext = getRootSpanFromRequestContext;
exports.setError = setError;
exports.setResource = setResource;
var _ddTrace = _interopRequireDefault(require("dd-trace"));
var _env = _interopRequireDefault(require("./../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// If the DataDog agent is installed and the DD_API_KEY environment variable is
// in the environment then we can safely attempt to start the DD tracer
if (_env.default.DD_API_KEY) {
  _ddTrace.default.init({
    version: _env.default.VERSION,
    service: _env.default.DD_SERVICE,
    env: _env.default.ENVIRONMENT,
    logInjection: true
  });
}
const getCurrentSpan = () => _ddTrace.default.scope().active();

/**
 * Add tags to a span to have more context about how and why it was running.
 * If added to the root span, tags are searchable and filterable.
 *
 * @param tags An object with the tags to add to the span
 * @param span An optional span object to add the tags to. If none provided,the current span will be used.
 */
function addTags(tags, span) {
  if (_ddTrace.default) {
    const currentSpan = span || getCurrentSpan();
    if (!currentSpan) {
      return;
    }
    currentSpan.addTags(tags);
  }
}

/**
 * The root span is an undocumented internal property that DataDog adds to `context.req`.
 * The root span is required in order to add searchable tags.
 * Unfortunately, there is no API to access the root span directly.
 * See: node_modules/dd-trace/src/plugins/util/web.js
 *
 * @param context A Koa context object
 */
function getRootSpanFromRequestContext(context) {
  // eslint-disable-next-line no-undef
  return context?.req?._datadog?.span ?? null;
}

/**
 * Change the resource of the active APM span. This method wraps addTags to allow
 * safe use in environments where APM is disabled.
 *
 * @param name The name of the resource
 */
function setResource(name) {
  if (_ddTrace.default) {
    addTags({
      "resource.name": `${name}`
    });
  }
}

/**
 * Mark the current active span as an error. This method wraps addTags to allow
 * safe use in environments where APM is disabled.
 *
 * @param error The error to add to the current span
 */
function setError(error, span) {
  if (_ddTrace.default) {
    addTags({
      errorMessage: error.message,
      "error.type": error.name,
      "error.msg": error.message,
      "error.stack": error.stack
    }, span);
  }
}
var _default = exports.default = _ddTrace.default;