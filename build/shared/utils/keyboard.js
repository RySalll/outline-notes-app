"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.altDisplay = void 0;
exports.isModKey = isModKey;
exports.metaDisplay = exports.meta = void 0;
var _browser = require("./browser");
const altDisplay = exports.altDisplay = (0, _browser.isMac)() ? "⌥" : "Alt";
const metaDisplay = exports.metaDisplay = (0, _browser.isMac)() ? "⌘" : "Ctrl";
const meta = exports.meta = (0, _browser.isMac)() ? "cmd" : "ctrl";
function isModKey(event) {
  return (0, _browser.isMac)() ? event.metaKey : event.ctrlKey;
}