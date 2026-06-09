"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mobx = require("mobx");
var _mobxReact = require("mobx-react");
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
var _urls = require("../../utils/urls");
var _class, _class2, _descriptor;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Frame = (0, _mobxReact.observer)(_class = (_class2 = class Frame extends React.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "mounted", void 0);
    _initializerDefineProperty(this, "isLoaded", _descriptor, this);
    _defineProperty(this, "loadIframe", () => {
      if (!this.mounted) {
        return;
      }
      this.isLoaded = true;
    });
  }
  componentDidMount() {
    this.mounted = true;
    setTimeout(this.loadIframe, 0);
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  render() {
    const {
      border,
      style = {},
      forwardedRef,
      icon,
      title,
      canonicalUrl,
      isSelected,
      referrerPolicy,
      className = "",
      src
    } = this.props;
    const showBottomBar = !!(icon || canonicalUrl);
    return /*#__PURE__*/React.createElement(Rounded, {
      style: style,
      $showBottomBar: showBottomBar,
      $border: border,
      className: isSelected ? `ProseMirror-selectednode ${className}` : className
    }, this.isLoaded && /*#__PURE__*/React.createElement(Iframe, {
      ref: forwardedRef,
      $showBottomBar: showBottomBar,
      sandbox: "allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-storage-access-by-user-activation",
      style: style,
      frameBorder: "0",
      title: "embed",
      loading: "lazy",
      src: (0, _urls.sanitizeUrl)(src),
      referrerPolicy: referrerPolicy,
      allowFullScreen: true
    }), showBottomBar && /*#__PURE__*/React.createElement(Bar, null, icon, " ", /*#__PURE__*/React.createElement(Title, null, title), canonicalUrl && /*#__PURE__*/React.createElement(Open, {
      href: canonicalUrl,
      target: "_blank",
      rel: "noopener noreferrer"
    }, /*#__PURE__*/React.createElement(_outlineIcons.OpenIcon, {
      size: 18
    }), " Open")));
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "isLoaded", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return false;
  }
}), _class2)) || _class;
const Iframe = _styledComponents.default.iframe`
  border-radius: ${props => props.$showBottomBar ? "3px 3px 0 0" : "3px"};
  display: block;
`;
const Rounded = _styledComponents.default.div`
  border: 1px solid
    ${props => props.$border ? props.theme.embedBorder : "transparent"};
  border-radius: 6px;
  overflow: hidden;

  ${props => props.$showBottomBar && `
    padding-bottom: 28px;
  `}
`;
const Open = _styledComponents.default.a`
  color: ${(0, _styles.s)("textSecondary")} !important;
  font-size: 13px;
  font-weight: 500;
  align-items: center;
  display: flex;
  position: absolute;
  right: 0;
  padding: 0 8px;
`;
const Title = _styledComponents.default.span`
  font-size: 13px;
  font-weight: 500;
  padding-left: 4px;
`;
const Bar = _styledComponents.default.div`
  display: flex;
  align-items: center;
  border-top: 1px solid ${props => props.theme.embedBorder};
  background: ${(0, _styles.s)("backgroundSecondary")};
  color: ${(0, _styles.s)("textSecondary")};
  padding: 0 8px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  user-select: none;
  height: 28px;
  position: relative;
`;
var _default = exports.default = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(Frame, _extends({}, props, {
  forwardedRef: ref
})));