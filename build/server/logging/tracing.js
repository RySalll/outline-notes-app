"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trace = trace;
exports.traceFunction = void 0;
var _tags = _interopRequireDefault(require("dd-trace/ext/tags"));
var _env = _interopRequireDefault(require("./../env"));
var _tracer = _interopRequireWildcard(require("./tracer"));
var Tracing = _tracer;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// MIT License

// Copyright (c) 2020 GameChanger Media

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * This decorator will cause an individual function to be traced by the APM.
 *
 * @param config Optional configuration for the span that will be created for this trace.
 */
const traceFunction = config => target => _env.default.ENVIRONMENT === "test" ? target : function wrapperFn() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  const {
    className,
    methodName = target.name,
    tags
  } = config;
  const childOf = config.isRoot ? undefined : _tracer.default.scope().active() || undefined;
  const spanName = config.spanName || className || "DEFAULT_SPAN_NAME";
  const resourceName = config.resourceName ? config.resourceName : methodName;
  const spanOptions = {
    childOf,
    tags: {
      [_tags.default.RESOURCE_NAME]: resourceName,
      ...tags
    }
  };
  const span = _tracer.default.startSpan(spanName, spanOptions);
  if (!span) {
    return target.call(this, ...args);
  }
  if (config.serviceName) {
    span.setTag(_tags.default.SERVICE_NAME, `${_env.default.DD_SERVICE}-${config.serviceName}`);
  }
  if (config.makeSearchable) {
    span.setTag(_tags.default.ANALYTICS, true);
  }

  // The callback fn needs to be wrapped in an arrow fn as the activate fn clobbers `this`
  return _tracer.default.scope().activate(span, () => {
    const output = target.call(this, ...args);
    if (output && typeof output.then === "function") {
      output.catch(error => {
        if (error instanceof Error) {
          Tracing.setError(error, span);
        }
      }).finally(() => {
        span.finish();
      });
    } else {
      span.finish();
    }
    return output;
  });
};
exports.traceFunction = traceFunction;
const traceMethod = config => function (target, _propertyKey, descriptor) {
  const wrappedFn = descriptor.value;
  if (wrappedFn) {
    const className = target.name || target.constructor.name; // target.name is needed if the target is the constructor itself
    const methodName = wrappedFn.name;
    descriptor.value = traceFunction({
      ...config,
      className,
      methodName
    })(wrappedFn);
  }
  return descriptor;
};
const traceClass = config => function (constructor) {
  const protoKeys = Reflect.ownKeys(constructor.prototype);
  protoKeys.forEach(key => {
    if (key === "constructor") {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);

    // eslint-disable-next-line no-undef
    if (typeof key === "string" && typeof descriptor?.value === "function") {
      Object.defineProperty(constructor.prototype, key, traceMethod(config)(constructor, key, descriptor));
    }
  });
  const staticKeys = Reflect.ownKeys(constructor);
  staticKeys.forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(constructor, key);

    // eslint-disable-next-line no-undef
    if (typeof key === "string" && typeof descriptor?.value === "function") {
      Object.defineProperty(constructor, key, traceMethod(config)(constructor, key, descriptor));
    }
  });
};

/**
 * This decorator will cause the methods of a class, or an individual method, to be traced by the APM.
 *
 * @param config Optional configuration for the span that will be created for this trace.
 */
// Going to rely on inferrence do its thing for this function
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function trace(config) {
  function traceDecorator(a, b, c) {
    if (typeof a === "function") {
      // Need to cast as there is no safe runtime way to check if a function is a constructor
      traceClass(config)(a);
    } else {
      traceMethod(config)(a, b, c);
    }
  }
  return traceDecorator;
}