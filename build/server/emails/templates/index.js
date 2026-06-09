"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _PluginManager = require("./../../utils/PluginManager");
var _fs = require("./../../utils/fs");
const emails = {};
(0, _fs.requireDirectory)(__dirname).forEach(_ref => {
  let [module, id] = _ref;
  if (id === "index") {
    return;
  }
  emails[id] = module.default;
});
_PluginManager.PluginManager.getHooks(_PluginManager.Hook.EmailTemplate).forEach(hook => {
  emails[hook.value.name] = hook.value;
});
var _default = exports.default = emails;