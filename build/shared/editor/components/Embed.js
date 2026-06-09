"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _embeds = require("../lib/embeds");
var _DisabledEmbed = _interopRequireDefault(require("./DisabledEmbed"));
var _Frame = _interopRequireDefault(require("./Frame"));
var _ResizeHandle = require("./ResizeHandle");
var _useDragResize = _interopRequireDefault(require("./hooks/useDragResize"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const Embed = props => {
  const ref = React.useRef(null);
  const {
    node,
    isEditable,
    onChangeSize
  } = props;
  const naturalWidth = 0;
  const naturalHeight = 400;
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
    if (node.attrs.height && node.attrs.height !== height) {
      setSize({
        width: node.attrs.width,
        height: node.attrs.height
      });
    }
  }, [node.attrs.height]);
  const style = {
    width: width || "100%",
    height: height || 400,
    maxWidth: "100%",
    pointerEvents: dragging ? "none" : "all"
  };
  return /*#__PURE__*/React.createElement(FrameWrapper, {
    ref: ref
  }, /*#__PURE__*/React.createElement(InnerEmbed, _extends({
    ref: ref,
    style: style
  }, props)), isEditable && isResizable && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_ResizeHandle.ResizeBottom, {
    onPointerDown: handlePointerDown("bottom"),
    $dragging: !!dragging
  })));
};
const InnerEmbed = /*#__PURE__*/React.forwardRef(function InnerEmbed_(_ref, ref) {
  let {
    isEditable,
    isSelected,
    theme,
    node,
    embeds,
    embedsDisabled,
    style
  } = _ref;
  const cache = React.useMemo(() => (0, _embeds.getMatchingEmbed)(embeds, node.attrs.href), [embeds, node.attrs.href]);
  if (!cache) {
    return null;
  }
  const {
    embed,
    matches
  } = cache;
  if (embedsDisabled) {
    return /*#__PURE__*/React.createElement(_DisabledEmbed.default, {
      href: node.attrs.href,
      embed: embed,
      isEditable: isEditable,
      isSelected: isSelected,
      theme: theme
    });
  }
  if (embed.transformMatch) {
    const src = embed.transformMatch(matches);
    return /*#__PURE__*/React.createElement(_Frame.default, {
      ref: ref,
      src: src,
      style: style,
      isSelected: isSelected,
      canonicalUrl: embed.hideToolbar ? undefined : node.attrs.href,
      title: embed.title,
      referrerPolicy: "origin",
      border: true
    });
  }
  if ("component" in embed) {
    return (
      /*#__PURE__*/
      // @ts-expect-error Component type
      React.createElement(embed.component, {
        ref: ref,
        attrs: node.attrs,
        style: style,
        matches: matches,
        isEditable: isEditable,
        isSelected: isSelected,
        embed: embed,
        theme: theme
      })
    );
  }
  return null;
});
const FrameWrapper = _styledComponents.default.div`
  line-height: 0;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  white-space: nowrap;
  cursor: default;
  border-radius: 8px;
  user-select: none;
  max-width: 100%;

  transition-property: width, max-height;
  transition-duration: 150ms;
  transition-timing-function: ease-in-out;

  &:hover {
    ${_ResizeHandle.ResizeLeft}, ${_ResizeHandle.ResizeRight} {
      opacity: 1;
    }
  }
`;
var _default = exports.default = Embed;