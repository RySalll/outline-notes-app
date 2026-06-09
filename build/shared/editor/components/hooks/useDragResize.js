"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDragResize;
var React = _interopRequireWildcard(require("react"));
var _EditorStyleHelper = require("../../styles/EditorStyleHelper");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Hook for resizing an element by dragging its sides.
 */

function useDragResize(props) {
  const [size, setSize] = React.useState({
    width: props.width,
    height: props.height
  });
  const [maxWidth, setMaxWidth] = React.useState(Infinity);
  const [offset, setOffset] = React.useState(0);
  const [sizeAtDragStart, setSizeAtDragStart] = React.useState(size);
  const [dragging, setDragging] = React.useState();
  const isResizable = !!props.onChangeSize;
  const constrainWidth = (width, max) => {
    const minWidth = Math.min(props.naturalWidth, props.gridSnap / 100 * max);
    return Math.round(Math.min(max, Math.max(width, minWidth)));
  };
  const handlePointerMove = event => {
    event.preventDefault();
    let diffX, diffY;
    if (dragging === "left") {
      diffX = offset - event.pageX;
    } else if (dragging === "right") {
      diffX = event.pageX - offset;
    } else {
      diffY = event.pageY - offset;
    }
    if (diffX && sizeAtDragStart.width) {
      const gridWidth = props.gridSnap / 100 * maxWidth;
      const newWidth = sizeAtDragStart.width + diffX * 2;
      const widthOnGrid = Math.round(newWidth / gridWidth) * gridWidth;
      const constrainedWidth = constrainWidth(widthOnGrid, maxWidth);
      const aspectRatio = props.naturalHeight / props.naturalWidth;
      setSize({
        width:
        // If the natural width is the same as the constrained width, use the natural width -
        // special case for images resized to the full width of the editor.
        constrainedWidth === Math.min(newWidth, maxWidth) ? props.naturalWidth : constrainedWidth,
        height: props.naturalWidth ? Math.round(constrainedWidth * aspectRatio) : undefined
      });
    }
    if (diffY && sizeAtDragStart.height) {
      const gridHeight = props.gridSnap / 100 * maxWidth;
      const newHeight = sizeAtDragStart.height + diffY;
      const heightOnGrid = Math.round(newHeight / gridHeight) * gridHeight;
      setSize(state => ({
        ...state,
        height: heightOnGrid
      }));
    }
  };
  const handlePointerUp = event => {
    event.preventDefault();
    event.stopPropagation();
    setOffset(0);
    setDragging(undefined);
    props.onChangeSize?.(size);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointermove", handlePointerMove);
  };
  const handleKeyDown = event => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setSize(sizeAtDragStart);
      setDragging(undefined);
    }
  };
  const handlePointerDown = dragDirection => event => {
    event.preventDefault();
    event.stopPropagation();

    // Calculate constraints once at the start of dragging as it's relatively expensive operation
    const max = props.ref.current ? parseInt(getComputedStyle(props.ref.current).getPropertyValue("--document-width")) - _EditorStyleHelper.EditorStyleHelper.padding * 2 : Infinity;
    setMaxWidth(max);
    setSizeAtDragStart({
      width: constrainWidth(size.width, max),
      height: size.height
    });
    setOffset(dragDirection === "left" || dragDirection === "right" ? event.pageX : event.pageY);
    setDragging(dragDirection);
  };
  React.useEffect(() => {
    if (!isResizable) {
      return;
    }
    if (dragging) {
      document.body.style.cursor = dragging === "left" || dragging === "right" ? "ew-resize" : "ns-resize";
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      document.body.style.cursor = "initial";
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp, isResizable]);
  return {
    handlePointerDown,
    dragging: !!dragging,
    setSize,
    width: size.width,
    height: size.height
  };
}