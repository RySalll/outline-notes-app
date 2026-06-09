"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageZoom = void 0;
var _polished = require("polished");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _EventBoundary = _interopRequireDefault(require("../../components/EventBoundary"));
var _styles = require("../../styles");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Zoom = /*#__PURE__*/React.lazy(() => Promise.resolve().then(() => _interopRequireWildcard(require("react-medium-image-zoom"))));
/**
 * Component that wraps an image with the ability to zoom in
 */
const ImageZoom = _ref => {
  let {
    caption,
    children
  } = _ref;
  const [isActivated, setIsActivated] = React.useState(false);
  const handleActivated = React.useCallback(() => {
    setIsActivated(true);
  }, []);
  const fallback = /*#__PURE__*/React.createElement("span", {
    onPointerEnter: handleActivated,
    onFocus: handleActivated
  }, children);
  const ZoomContent = React.useMemo(() => function ZoomContentComponent(props) {
    return /*#__PURE__*/React.createElement(Lightbox, _extends({
      caption: caption
    }, props));
  }, [caption]);
  if (!isActivated) {
    return fallback;
  }
  return /*#__PURE__*/React.createElement(React.Suspense, {
    fallback: fallback
  }, /*#__PURE__*/React.createElement(Styles, null), /*#__PURE__*/React.createElement(_EventBoundary.default, {
    captureEvents: "click"
  }, /*#__PURE__*/React.createElement(Zoom, {
    zoomMargin: _EditorStyleHelper.EditorStyleHelper.padding,
    ZoomContent: ZoomContent
  }, /*#__PURE__*/React.createElement("div", null, children))));
};
exports.ImageZoom = ImageZoom;
const Lightbox = _ref2 => {
  let {
    caption,
    modalState,
    img
  } = _ref2;
  return /*#__PURE__*/React.createElement(Figure, null, img, /*#__PURE__*/React.createElement(Caption, {
    $loaded: modalState === "LOADED"
  }, caption));
};
const Figure = (0, _styledComponents.default)("figure")`
  margin: 0;
`;
const Caption = (0, _styledComponents.default)("figcaption")`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  font-size: 14px;
  opacity: ${props => props.$loaded ? 1 : 0};
  transition: opacity 250ms;

  font-weight: normal;
  color: ${(0, _styles.s)("textSecondary")};
`;
const Styles = (0, _styledComponents.createGlobalStyle)`
  [data-rmiz-ghost] {
    position: absolute;
    pointer-events: none;
  }
  [data-rmiz-btn-zoom],
  [data-rmiz-btn-unzoom] {
    display: none;
  }
  [data-rmiz-btn-zoom]:not(:focus):not(:active) {
    position: absolute;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    pointer-events: none;
    white-space: nowrap;
    width: 1px;
  }
  [data-rmiz-btn-zoom] {
    position: absolute;
    inset: 10px 10px auto auto;
    cursor: zoom-in;
  }
  [data-rmiz-btn-unzoom] {
    position: absolute;
    inset: 20px 20px auto auto;
    cursor: zoom-out;
    z-index: 1;
  }
  [data-rmiz-content="found"] img,
  [data-rmiz-content="found"] svg,
  [data-rmiz-content="found"] [role="img"],
  [data-rmiz-content="found"] [data-zoom] {
    cursor: zoom-in;
  }
  [data-rmiz-modal] {
    outline: none;
  }
  [data-rmiz-modal]::backdrop {
    display: none;
  }
  [data-rmiz-modal][open] {
    position: fixed;
    width: 100vw;
    width: 100dvw;
    height: 100vh;
    height: 100dvh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow: hidden;
  }
  [data-rmiz-modal-overlay] {
    position: absolute;
    inset: 0;
    transition: background-color 0.3s;
  }
  [data-rmiz-modal-overlay="hidden"] {
    background-color: ${props => (0, _polished.transparentize)(1, props.theme.background)};
  }
  [data-rmiz-modal-overlay="visible"] {
    background-color: ${(0, _styles.s)("background")};
  }
  [data-rmiz-modal-content] {
    position: relative;
    width: 100%;
    height: 100%;
  }
  [data-rmiz-modal-img] {
    position: absolute;
    cursor: zoom-out;
    image-rendering: high-quality;
    transform-origin: top left;
    transition: transform 0.3s;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-rmiz-modal-overlay],
    [data-rmiz-modal-img] {
      transition-duration: 0.01ms !important;
    }
  }
`;