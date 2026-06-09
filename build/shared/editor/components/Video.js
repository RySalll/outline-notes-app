"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Video;
exports.videoStyle = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _urls = require("../../utils/urls");
var _ResizeHandle = require("./ResizeHandle");
var _useDragResize = _interopRequireDefault(require("./hooks/useDragResize"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Video(props) {
  const {
    isSelected,
    node,
    isEditable,
    children,
    onChangeSize
  } = props;
  const [naturalWidth] = React.useState(node.attrs.width);
  const [naturalHeight] = React.useState(node.attrs.height);
  const ref = React.useRef(null);
  const isResizable = !!onChangeSize;
  const {
    width,
    height,
    setSize,
    handlePointerDown,
    dragging
  } = (0, _useDragResize.default)({
    width: node.attrs.width ?? naturalWidth,
    height: node.attrs.height ?? naturalHeight,
    naturalWidth,
    naturalHeight,
    gridSnap: 5,
    onChangeSize,
    ref
  });
  React.useEffect(() => {
    if (node.attrs.width && node.attrs.width !== width) {
      setSize({
        width: node.attrs.width,
        height: node.attrs.height
      });
    }
  }, [node.attrs.width]);
  const style = {
    width: width || "auto",
    maxHeight: height || "auto",
    pointerEvents: dragging ? "none" : "all"
  };
  return /*#__PURE__*/React.createElement("div", {
    contentEditable: false,
    ref: ref
  }, /*#__PURE__*/React.createElement(VideoWrapper, {
    className: isSelected ? "ProseMirror-selectednode" : "",
    style: style
  }, /*#__PURE__*/React.createElement(StyledVideo, {
    src: (0, _urls.sanitizeUrl)(node.attrs.src),
    title: node.attrs.title,
    style: style,
    controls: !dragging
  }), isEditable && isResizable && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_ResizeHandle.ResizeLeft, {
    onPointerDown: handlePointerDown("left"),
    $dragging: !!dragging
  }), /*#__PURE__*/React.createElement(_ResizeHandle.ResizeRight, {
    onPointerDown: handlePointerDown("right"),
    $dragging: !!dragging
  }))), children);
}
const videoStyle = exports.videoStyle = (0, _styledComponents.css)`
  max-width: 100%;
  height: auto;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text} !important;
  margin: -2px;
  padding: 2px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px ${props => props.theme.divider};
`;
const StyledVideo = _styledComponents.default.video`
  ${videoStyle}
`;
const VideoWrapper = _styledComponents.default.div`
  line-height: 0;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  white-space: nowrap;
  cursor: default;
  border-radius: 8px;
  user-select: none;
  max-width: 100%;
  overflow: hidden;

  transition-property: width, max-height;
  transition-duration: 150ms;
  transition-timing-function: ease-in-out;

  video {
    transition-property: width, max-height;
    transition-duration: 150ms;
    transition-timing-function: ease-in-out;
  }

  &:hover {
    ${_ResizeHandle.ResizeLeft}, ${_ResizeHandle.ResizeRight} {
      opacity: 1;
    }
  }
`;