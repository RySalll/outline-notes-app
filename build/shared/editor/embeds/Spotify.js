"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Spotify(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  let pathname = "";
  try {
    const parsed = new URL(props.attrs.href);
    pathname = parsed.pathname;
  } catch (err) {
    pathname = "";
  }
  const normalizedPath = pathname.replace(/^\/embed/, "/");
  let height;
  if (normalizedPath.includes("episode") || normalizedPath.includes("show")) {
    height = 232;
  } else if (normalizedPath.includes("track")) {
    height = 80;
  } else {
    height = 380;
  }
  return /*#__PURE__*/React.createElement(SpotifyFrame, _extends({}, props, {
    width: "100%",
    height: `${height}px`,
    src: `https://open.spotify.com/embed${normalizedPath}`,
    title: "Spotify Embed",
    allow: "encrypted-media"
  }));
}
const SpotifyFrame = (0, _styledComponents.default)(_Frame.default)`
  border-radius: 13px;
`;
var _default = exports.default = Spotify;