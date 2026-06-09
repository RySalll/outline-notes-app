"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mobxReact = require("mobx-react");
var _prosemirrorKeymap = require("prosemirror-keymap");
var _prosemirrorMarkdown = require("prosemirror-markdown");
var _rules = _interopRequireDefault(require("./markdown/rules"));
var _serializer = require("./markdown/serializer");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class ExtensionManager {
  constructor() {
    let extensions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let editor = arguments.length > 1 ? arguments[1] : undefined;
    _defineProperty(this, "extensions", []);
    extensions.forEach(ext => {
      let extension;
      if (typeof ext === "function") {
        // @ts-expect-error We won't instantiate an abstract class
        extension = new ext(editor?.props);
      } else {
        extension = ext;
      }
      if (editor) {
        extension.bindEditor(editor);
      }
      this.extensions.push(extension);
    });
  }
  get widgets() {
    return this.extensions.filter(extension => extension.widget({
      rtl: false,
      readOnly: false
    })).reduce((memo, node) => ({
      ...memo,
      [node.name]: (0, _mobxReact.observer)(node.widget)
    }), {});
  }
  get nodes() {
    const nodes = this.extensions.filter(extension => extension.type === "node").reduce((memo, node) => ({
      ...memo,
      [node.name]: node.schema
    }), {});
    for (const i in nodes) {
      const {
        marks
      } = nodes[i];
      if (marks) {
        // We must filter marks from the marks list that are not defined
        // in the schema for the current editor.
        nodes[i].marks = marks.split(" ").filter(m => Object.keys(this.marks).includes(m)).join(" ");
      }
    }
    return nodes;
  }
  get marks() {
    const marks = this.extensions.filter(extension => extension.type === "mark").reduce((memo, mark) => ({
      ...memo,
      [mark.name]: mark.schema
    }), {});
    for (const i in marks) {
      const {
        excludes
      } = marks[i];
      if (excludes) {
        // We must filter marks from the excludes list that are not defined
        // in the schema for the current editor.
        marks[i].excludes = excludes.split(" ").filter(m => Object.keys(marks).includes(m)).join(" ");
      }
    }
    return marks;
  }
  serializer() {
    const nodes = this.extensions.filter(extension => extension.type === "node").reduce((memo, extension) => ({
      ...memo,
      [extension.name]: extension.toMarkdown
    }), {});
    const marks = this.extensions.filter(extension => extension.type === "mark").reduce((memo, extension) => ({
      ...memo,
      [extension.name]: extension.toMarkdown
    }), {});
    return new _serializer.MarkdownSerializer(nodes, marks);
  }
  parser(_ref) {
    let {
      schema,
      rules,
      plugins
    } = _ref;
    const tokens = this.extensions.filter(extension => extension.type === "mark" || extension.type === "node").reduce((nodes, extension) => {
      const parseSpec = extension.parseMarkdown();
      if (!parseSpec) {
        return nodes;
      }
      return {
        ...nodes,
        [extension.markdownToken || extension.name]: parseSpec
      };
    }, {});
    return new _prosemirrorMarkdown.MarkdownParser(schema, (0, _rules.default)({
      rules,
      schema,
      plugins
    }), tokens);
  }
  get plugins() {
    return this.extensions.filter(extension => "plugins" in extension).reduce((allPlugins, _ref2) => {
      let {
        plugins
      } = _ref2;
      return [...allPlugins, ...plugins];
    }, []);
  }
  get rulePlugins() {
    return this.extensions.filter(extension => "rulePlugins" in extension).reduce((allRulePlugins, _ref3) => {
      let {
        rulePlugins
      } = _ref3;
      return [...allRulePlugins, ...rulePlugins];
    }, []);
  }
  keymaps(_ref4) {
    let {
      schema
    } = _ref4;
    const keymaps = this.extensions.filter(extension => extension.keys).map(extension => ["node", "mark"].includes(extension.type) ? extension.keys({
      // @ts-expect-error TODO
      type: schema[`${extension.type}s`][extension.name],
      schema
    }) : extension.keys({
      schema
    }));
    return keymaps.map(_prosemirrorKeymap.keymap);
  }
  inputRules(_ref5) {
    let {
      schema
    } = _ref5;
    const extensionInputRules = this.extensions.filter(extension => ["extension"].includes(extension.type)).filter(extension => extension.inputRules).map(extension => extension.inputRules({
      schema
    }));
    const nodeMarkInputRules = this.extensions.filter(extension => ["node", "mark"].includes(extension.type)).filter(extension => extension.inputRules).map(extension => extension.inputRules({
      // @ts-expect-error TODO
      type: schema[`${extension.type}s`][extension.name],
      schema
    }));
    return [...extensionInputRules, ...nodeMarkInputRules].reduce((allInputRules, inputRules) => [...allInputRules, ...inputRules], []);
  }
  commands(_ref6) {
    let {
      schema,
      view
    } = _ref6;
    return this.extensions.filter(extension => extension.commands).reduce((allCommands, extension) => {
      const {
        name,
        type
      } = extension;
      const commands = {};

      // @ts-expect-error FIXME
      const value = extension.commands({
        schema,
        ...(["node", "mark"].includes(type) ? {
          // @ts-expect-error TODO
          type: schema[`${type}s`][name]
        } : {})
      });
      const apply = (callback, attrs) => {
        if (!view.editable && !extension.allowInReadOnly) {
          return;
        }
        if (extension.focusAfterExecution) {
          view.focus();
        }
        return callback(attrs)?.(view.state, view.dispatch, view);
      };
      const handle = (_name, _value) => {
        const values = Array.isArray(_value) ? _value : [_value];

        // @ts-expect-error FIXME
        commands[_name] = attrs => values.forEach(callback => apply(callback, attrs));
      };
      if (typeof value === "object") {
        Object.entries(value).forEach(_ref7 => {
          let [commandName, commandValue] = _ref7;
          handle(commandName, commandValue);
        });
      } else if (value) {
        handle(name, value);
      }
      return {
        ...allCommands,
        ...commands
      };
    }, {});
  }
}
exports.default = ExtensionManager;