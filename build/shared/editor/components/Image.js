"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _Flex = _interopRequireDefault(require("../../components/Flex"));
var _styles = require("../../styles");
var _urls = require("../../utils/urls");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _ImageZoom = require("./ImageZoom");
var _ResizeHandle = require("./ResizeHandle");
var _useDragResize = _interopRequireDefault(require("./hooks/useDragResize"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Image = props => {
  const {
    isSelected,
    node,
    isEditable,
    onChangeSize
  } = props;
  const {
    src,
    layoutClass
  } = node.attrs;
  const className = layoutClass ? `image image-${layoutClass}` : "image";
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [naturalWidth, setNaturalWidth] = React.useState(node.attrs.width);
  const [naturalHeight, setNaturalHeight] = React.useState(node.attrs.height);
  const ref = React.useRef(null);
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
  const isFullWidth = layoutClass === "full-width";
  const isResizable = !!props.onChangeSize && !error;
  const isDownloadable = !!props.onDownload && !error;
  React.useEffect(() => {
    if (node.attrs.width && node.attrs.width !== width) {
      setSize({
        width: node.attrs.width,
        height: node.attrs.height
      });
    }
  }, [node.attrs.width]);
  const sanitizedSrc = (0, _urls.sanitizeUrl)(src);
  const handleOpen = React.useCallback(() => {
    window.open(sanitizedSrc, "_blank");
  }, [sanitizedSrc]);
  const widthStyle = isFullWidth ? {
    width: "var(--container-width)"
  } : {
    width: width || "auto"
  };
  return /*#__PURE__*/React.createElement("div", {
    contentEditable: false,
    className: className,
    ref: ref
  }, /*#__PURE__*/React.createElement(ImageWrapper, {
    isFullWidth: isFullWidth,
    className: isSelected || dragging ? "ProseMirror-selectednode" : "",
    onClick: dragging ? undefined : props.onClick,
    style: widthStyle
  }, !dragging && width > 60 && isDownloadable && /*#__PURE__*/React.createElement(Actions, null, (0, _urls.isExternalUrl)(src) && /*#__PURE__*/React.createElement(Button, {
    onClick: handleOpen
  }, /*#__PURE__*/React.createElement(_outlineIcons.GlobeIcon, null)), /*#__PURE__*/React.createElement(Button, {
    onClick: props.onDownload
  }, /*#__PURE__*/React.createElement(_outlineIcons.DownloadIcon, null))), error ? /*#__PURE__*/React.createElement(Error, {
    style: widthStyle,
    className: _EditorStyleHelper.EditorStyleHelper.imageHandle
  }, /*#__PURE__*/React.createElement(_outlineIcons.CrossIcon, {
    size: 16
  }), " Image failed to load") : /*#__PURE__*/React.createElement(_ImageZoom.ImageZoom, {
    caption: props.node.attrs.alt
  }, /*#__PURE__*/React.createElement("img", {
    className: _EditorStyleHelper.EditorStyleHelper.imageHandle,
    style: {
      ...widthStyle,
      display: loaded ? "block" : "none",
      pointerEvents: dragging || !props.isSelected && props.isEditable ? "none" : "all"
    },
    src: sanitizedSrc,
    onError: () => {
      setError(true);
      setLoaded(true);
    },
    onLoad: ev => {
      // For some SVG's Firefox does not provide the naturalWidth, in this
      // rare case we need to provide a default so that the image can be
      // seen and is not sized to 0px
      const nw = ev.target.naturalWidth || 300;
      const nh = ev.target.naturalHeight;
      setNaturalWidth(nw);
      setNaturalHeight(nh);
      setLoaded(true);
      if (!node.attrs.width) {
        setSize(state => ({
          ...state,
          width: nw
        }));
      }
    }
  }), !loaded && width && height && /*#__PURE__*/React.createElement("img", {
    style: {
      ...widthStyle,
      display: "block"
    },
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(getPlaceholder(width, height))}`
  })), isEditable && !isFullWidth && isResizable && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_ResizeHandle.ResizeLeft, {
    onPointerDown: handlePointerDown("left"),
    $dragging: !!dragging
  }), /*#__PURE__*/React.createElement(_ResizeHandle.ResizeRight, {
    onPointerDown: handlePointerDown("right"),
    $dragging: !!dragging
  }))), isFullWidth && props.children ? /*#__PURE__*/React.cloneElement(props.children, {
    style: widthStyle
  }) : props.children);
};
function getPlaceholder(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" />`;
}
const Error = (0, _styledComponents.default)(_Flex.default)`
  max-width: 100%;
  color: ${(0, _styles.s)("textTertiary")};
  font-size: 14px;
  background: ${(0, _styles.s)("backgroundSecondary")};
  border-radius: 4px;
  min-width: 33vw;
  height: 80px;
  align-items: center;
  justify-content: center;
  user-select: none;
`;
const Actions = _styledComponents.default.div`
  display: flex;
  align-items: center;
  position: absolute;
  gap: 1px;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 150ms ease-in-out;

  &:hover {
    opacity: 1;
  }
`;
const Button = _styledComponents.default.button`
  border: 0;
  margin: 0;
  padding: 0;
  border-radius: 4px;
  background: ${(0, _styles.s)("background")};
  color: ${(0, _styles.s)("textSecondary")};
  width: 24px;
  height: 24px;
  display: inline-block;
  cursor: var(--pointer) !important;
  transition: opacity 150ms ease-in-out;

  &:first-child:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:last-child:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    color: ${(0, _styles.s)("text")};
  }
`;
const ImageWrapper = _styledComponents.default.div`
  line-height: 0;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: ${props => props.isFullWidth ? "initial" : "100%"};
  transition-property: width, height;
  transition-duration: ${props => props.isFullWidth ? "0ms" : "150ms"};
  transition-timing-function: ease-in-out;
  overflow: hidden;

  img {
    transition-property: width, height;
    transition-duration: ${props => props.isFullWidth ? "0ms" : "150ms"};
    transition-timing-function: ease-in-out;
  }

  &:hover {
    ${Actions} {
      opacity: 0.9;
    }

    ${_ResizeHandle.ResizeLeft}, ${_ResizeHandle.ResizeRight} {
      opacity: 1;
    }
  }
`;
var _default = exports.default = Image;