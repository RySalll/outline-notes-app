"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PluginPriority = exports.PluginManager = exports.Hook = void 0;
var _path = _interopRequireDefault(require("path"));
var _glob = require("glob");
var _isArray = _interopRequireDefault(require("lodash/isArray"));
var _sortBy = _interopRequireDefault(require("lodash/sortBy"));
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let PluginPriority = exports.PluginPriority = /*#__PURE__*/function (PluginPriority) {
  PluginPriority[PluginPriority["VeryHigh"] = 0] = "VeryHigh";
  PluginPriority[PluginPriority["High"] = 100] = "High";
  PluginPriority[PluginPriority["Normal"] = 200] = "Normal";
  PluginPriority[PluginPriority["Low"] = 300] = "Low";
  PluginPriority[PluginPriority["VeryLow"] = 500] = "VeryLow";
  return PluginPriority;
}({});
/**
 * The different types of server plugins that can be registered.
 */
let Hook = exports.Hook = /*#__PURE__*/function (Hook) {
  Hook["API"] = "api";
  Hook["AuthProvider"] = "authProvider";
  Hook["EmailTemplate"] = "emailTemplate";
  Hook["Processor"] = "processor";
  Hook["Task"] = "task";
  Hook["UnfurlProvider"] = "unfurl";
  Hook["Uninstall"] = "uninstall";
  return Hook;
}({});
/**
 * A map of plugin types to their values, for example an API plugin would have a value of type
 * Router. Registering an API plugin causes the router to be mounted.
 */
/**
 * Server plugin manager.
 */
class PluginManager {
  /**
   * Add plugins to the manager.
   *
   * @param plugins
   */
  static add(plugins) {
    if ((0, _isArray.default)(plugins)) {
      return plugins.forEach(plugin => this.register(plugin));
    }
    this.register(plugins);
  }
  static register(plugin) {
    if (!this.plugins.has(plugin.type)) {
      this.plugins.set(plugin.type, []);
    }
    this.plugins.get(plugin.type).push({
      ...plugin,
      priority: plugin.priority ?? PluginPriority.Normal
    });

    // Do not log plugin registration in forked worker processes, one log from the master process
    // is enough. This can be detected by the presence of `process.send`.
    if (process.send === undefined) {
      _Logger.default.debug("plugins", `Plugin(type=${plugin.type}) registered ${"name" in plugin.value ? plugin.value.name : ""} ${plugin.description ? `(${plugin.description})` : ""}`);
    }
  }

  /**
   * Returns all the plugins of a given type in order of priority.
   *
   * @param type The type of plugin to filter by
   * @returns A list of plugins
   */
  static getHooks(type) {
    this.loadPlugins();
    return (0, _sortBy.default)(this.plugins.get(type) || [], "priority");
  }

  /**
   * Load plugin server components (anything in the `/server/` directory of a plugin will be loaded)
   */
  static loadPlugins() {
    if (this.loaded) {
      return;
    }
    const rootDir = _env.default.ENVIRONMENT === "test" ? "" : "build";
    _glob.glob.sync(_path.default.join(rootDir, "plugins/*/server/!(*.test|schema).[jt]s")).forEach(filePath => {
      require(_path.default.join(process.cwd(), filePath));
    });
    this.loaded = true;
  }
}
exports.PluginManager = PluginManager;
_defineProperty(PluginManager, "plugins", new Map());
_defineProperty(PluginManager, "loaded", false);