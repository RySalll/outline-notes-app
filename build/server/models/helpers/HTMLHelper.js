"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cssInlineWasm = require("@css-inline/css-inline-wasm");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _env = _interopRequireDefault(require("./../../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let initialized = false;
class HTMLHelper {
  /**
   * Move CSS styles from <style> tags to inline styles with default settings.
   *
   * @param html The HTML to inline CSS styles for.
   * @returns The HTML with CSS styles inlined.
   */
  static async inlineCSS(html) {
    if (!initialized) {
      const path = require.resolve("@css-inline/css-inline-wasm/index_bg.wasm");
      await (0, _cssInlineWasm.initWasm)(_fsExtra.default.readFileSync(path));
      initialized = true;
    }
    return (0, _cssInlineWasm.inline)(html, {
      baseUrl: _env.default.URL,
      inlineStyleTags: true,
      keepLinkTags: false,
      keepStyleTags: false,
      loadRemoteStylesheets: false
    });
  }
}
exports.default = HTMLHelper;