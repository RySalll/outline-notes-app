"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Extension {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "editor", void 0);
    this.options = {
      ...this.defaultOptions,
      ...options
    };
  }
  bindEditor(editor) {
    this.editor = editor;
  }
  get type() {
    return "extension";
  }
  get name() {
    return "";
  }
  get plugins() {
    return [];
  }
  get rulePlugins() {
    return [];
  }
  get defaultOptions() {
    return {};
  }
  get allowInReadOnly() {
    return false;
  }
  get focusAfterExecution() {
    return true;
  }

  /**
   * A widget is a React component to be rendered in the editor's context, independent of any
   * specific node or mark. It can be used to render things like toolbars, menus, etc. Note that
   * all widgets are observed automatically, so you can use observable values.
   *
   * @returns A React component
   */
  widget(_props) {
    return undefined;
  }

  /**
   * A map of ProseMirror keymap bindings. It can be used to bind keyboard shortcuts to commands.
   *
   * @returns An object mapping key bindings to commands
   */
  keys(_options) {
    return {};
  }

  /**
   * A map of ProseMirror input rules. It can be used to automatically replace certain patterns
   * while typing.
   *
   * @returns An array of input rules
   */
  inputRules(_options) {
    return [];
  }

  /**
   * A map of ProseMirror commands. It can be used to expose commands to the editor. If a single
   * command is returned, it will be available under the extension's name.
   *
   * @returns An object mapping command names to command factories, or a command factory
   */
  commands(_options) {
    return {};
  }
}
exports.default = Extension;