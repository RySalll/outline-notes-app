"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function YouTube(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  const videoId = matches[1];
  let src;
  try {
    const url = new URL(props.attrs.href);
    const searchParams = new URLSearchParams(url.search);
    const start = searchParams.get("t")?.replace(/s$/, "");

    // Youtube returns the url in a html encoded format where
    // '&' is replaced by '&amp;'. So we also check if the search params
    // contain html encoded query params.
    const clip = (searchParams.get("clip") || searchParams.get("amp;clip"))?.replace(/s$/, "");
    const clipt = (searchParams.get("clipt") || searchParams.get("amp;clipt"))?.replace(/s$/, "");
    src = `https://www.youtube.com/embed/${videoId}?modestbranding=1${start ? `&start=${start}` : ""}${clip ? `&clip=${clip}` : ""}${clipt ? `&clipt=${clipt}` : ""}`;
  } catch (_e) {
    // noop
  }
  return /*#__PURE__*/React.createElement(_Frame.default, _extends({}, props, {
    src: src,
    title: `YouTube (${videoId})`
  }));
}
var _default = exports.default = YouTube;