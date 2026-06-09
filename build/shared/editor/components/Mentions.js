"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MentionUser = exports.MentionDocument = void 0;
var _mobxReact = require("mobx-react");
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _reactRouterDom = require("react-router-dom");
var _Icon = _interopRequireDefault(require("../../components/Icon"));
var _useStores = _interopRequireDefault(require("../../hooks/useStores"));
var _utils = require("../styles/utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const getAttributesFromNode = node => {
  const spec = node.type.spec.toDOM?.(node);
  const {
    class: className,
    ...attrs
  } = spec[1];
  return {
    className,
    ...attrs
  };
};
const MentionUser = exports.MentionUser = (0, _mobxReact.observer)(function MentionUser_(props) {
  const {
    isSelected,
    node
  } = props;
  const {
    users
  } = (0, _useStores.default)();
  const user = users.get(node.attrs.modelId);
  const {
    className,
    ...attrs
  } = getAttributesFromNode(node);
  return /*#__PURE__*/React.createElement("span", _extends({}, attrs, {
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    })
  }), /*#__PURE__*/React.createElement(_outlineIcons.EmailIcon, {
    size: 18
  }), user?.name || node.attrs.label);
});
const MentionDocument = exports.MentionDocument = (0, _mobxReact.observer)(function MentionDocument_(props) {
  const {
    isSelected,
    node
  } = props;
  const {
    documents
  } = (0, _useStores.default)();
  const doc = documents.get(node.attrs.modelId);
  const modelId = node.attrs.modelId;
  const {
    className,
    ...attrs
  } = getAttributesFromNode(node);
  React.useEffect(() => {
    if (modelId) {
      void documents.prefetchDocument(modelId);
    }
  }, [modelId, documents]);
  return /*#__PURE__*/React.createElement(_reactRouterDom.Link, _extends({}, attrs, {
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    to: doc?.path ?? `/doc/${node.attrs.modelId}`
  }), doc?.icon ? /*#__PURE__*/React.createElement(_Icon.default, {
    value: doc?.icon,
    color: doc?.color,
    size: 18
  }) : /*#__PURE__*/React.createElement(_outlineIcons.DocumentIcon, {
    size: 18
  }), doc?.title || node.attrs.label);
});