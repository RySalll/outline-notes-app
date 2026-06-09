"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _server = _interopRequireDefault(require("react-dom/server"));
var _env = _interopRequireDefault(require("./../env"));
var _readManifestFile = _interopRequireDefault(require("./readManifestFile"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const prefetchTags = [];
if (_env.default.AWS_S3_ACCELERATE_URL) {
  prefetchTags.push(/*#__PURE__*/React.createElement("link", {
    rel: "preconnect",
    href: _env.default.AWS_S3_ACCELERATE_URL,
    key: _env.default.AWS_S3_ACCELERATE_URL
  }));
} else if (_env.default.AWS_S3_UPLOAD_BUCKET_URL) {
  prefetchTags.push(/*#__PURE__*/React.createElement("link", {
    rel: "preconnect",
    href: _env.default.AWS_S3_UPLOAD_BUCKET_URL,
    key: _env.default.AWS_S3_UPLOAD_BUCKET_URL
  }));
}
if (_env.default.CDN_URL) {
  prefetchTags.push(/*#__PURE__*/React.createElement("link", {
    rel: "preconnect",
    href: _env.default.CDN_URL,
    key: _env.default.CDN_URL
  }));
}
if (_env.default.isProduction) {
  const manifest = (0, _readManifestFile.default)();
  const returnFileAndImportsFromManifest = (manifestStructure, file) => [manifestStructure[file]["file"], ...(manifestStructure[file]["imports"] ?? []).map(entry => manifestStructure[entry]["file"])];
  Array.from([...returnFileAndImportsFromManifest(manifest, "app/index.tsx"), ...returnFileAndImportsFromManifest(manifest, "app/editor/index.tsx")]).forEach(file => {
    if (file.endsWith(".js")) {
      prefetchTags.push(/*#__PURE__*/React.createElement("link", {
        rel: "prefetch",
        href: `${_env.default.CDN_URL || ""}/static/${file}`,
        key: file,
        as: "script",
        crossOrigin: "anonymous"
      }));
    } else if (file.endsWith(".css")) {
      prefetchTags.push(/*#__PURE__*/React.createElement("link", {
        rel: "prefetch",
        href: `${_env.default.CDN_URL || ""}/static/${file}`,
        key: file,
        as: "style",
        crossOrigin: "anonymous"
      }));
    }
  });
}
var _default = exports.default = _server.default.renderToString(/*#__PURE__*/React.createElement(React.Fragment, null, prefetchTags));