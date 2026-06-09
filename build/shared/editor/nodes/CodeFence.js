"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _core = _interopRequireDefault(require("refractor/core"));
var _bash = _interopRequireDefault(require("refractor/lang/bash"));
var _clike = _interopRequireDefault(require("refractor/lang/clike"));
var _cpp = _interopRequireDefault(require("refractor/lang/cpp"));
var _csharp = _interopRequireDefault(require("refractor/lang/csharp"));
var _css = _interopRequireDefault(require("refractor/lang/css"));
var _docker = _interopRequireDefault(require("refractor/lang/docker"));
var _elixir = _interopRequireDefault(require("refractor/lang/elixir"));
var _erlang = _interopRequireDefault(require("refractor/lang/erlang"));
var _go = _interopRequireDefault(require("refractor/lang/go"));
var _graphql = _interopRequireDefault(require("refractor/lang/graphql"));
var _groovy = _interopRequireDefault(require("refractor/lang/groovy"));
var _haskell = _interopRequireDefault(require("refractor/lang/haskell"));
var _hcl = _interopRequireDefault(require("refractor/lang/hcl"));
var _ini = _interopRequireDefault(require("refractor/lang/ini"));
var _java = _interopRequireDefault(require("refractor/lang/java"));
var _javascript = _interopRequireDefault(require("refractor/lang/javascript"));
var _json = _interopRequireDefault(require("refractor/lang/json"));
var _jsx = _interopRequireDefault(require("refractor/lang/jsx"));
var _kotlin = _interopRequireDefault(require("refractor/lang/kotlin"));
var _lisp = _interopRequireDefault(require("refractor/lang/lisp"));
var _lua = _interopRequireDefault(require("refractor/lang/lua"));
var _markup = _interopRequireDefault(require("refractor/lang/markup"));
var _mermaid = _interopRequireDefault(require("refractor/lang/mermaid"));
var _nginx = _interopRequireDefault(require("refractor/lang/nginx"));
var _nix = _interopRequireDefault(require("refractor/lang/nix"));
var _objectivec = _interopRequireDefault(require("refractor/lang/objectivec"));
var _ocaml = _interopRequireDefault(require("refractor/lang/ocaml"));
var _perl = _interopRequireDefault(require("refractor/lang/perl"));
var _php = _interopRequireDefault(require("refractor/lang/php"));
var _powershell = _interopRequireDefault(require("refractor/lang/powershell"));
var _protobuf = _interopRequireDefault(require("refractor/lang/protobuf"));
var _python = _interopRequireDefault(require("refractor/lang/python"));
var _r = _interopRequireDefault(require("refractor/lang/r"));
var _ruby = _interopRequireDefault(require("refractor/lang/ruby"));
var _rust = _interopRequireDefault(require("refractor/lang/rust"));
var _sass = _interopRequireDefault(require("refractor/lang/sass"));
var _scala = _interopRequireDefault(require("refractor/lang/scala"));
var _scss = _interopRequireDefault(require("refractor/lang/scss"));
var _solidity = _interopRequireDefault(require("refractor/lang/solidity"));
var _sql = _interopRequireDefault(require("refractor/lang/sql"));
var _swift = _interopRequireDefault(require("refractor/lang/swift"));
var _toml = _interopRequireDefault(require("refractor/lang/toml"));
var _tsx = _interopRequireDefault(require("refractor/lang/tsx"));
var _typescript = _interopRequireDefault(require("refractor/lang/typescript"));
var _verilog = _interopRequireDefault(require("refractor/lang/verilog"));
var _vhdl = _interopRequireDefault(require("refractor/lang/vhdl"));
var _visualBasic = _interopRequireDefault(require("refractor/lang/visual-basic"));
var _yaml = _interopRequireDefault(require("refractor/lang/yaml"));
var _zig = _interopRequireDefault(require("refractor/lang/zig"));
var _sonner = require("sonner");
var _browser = require("../../utils/browser");
var _backspaceToParagraph = _interopRequireDefault(require("../commands/backspaceToParagraph"));
var _codeFence = require("../commands/codeFence");
var _selectAll = require("../commands/selectAll");
var _toggleBlockType = _interopRequireDefault(require("../commands/toggleBlockType"));
var _Mermaid = _interopRequireDefault(require("../extensions/Mermaid"));
var _Prism = _interopRequireDefault(require("../extensions/Prism"));
var _code = require("../lib/code");
var _isCode = require("../lib/isCode");
var _findNewlines = require("../queries/findNewlines");
var _findParentNode = require("../queries/findParentNode");
var _getMarkRange = require("../queries/getMarkRange");
var _isInCode = require("../queries/isInCode");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// @ts-expect-error type definition is missing, but package exists

const DEFAULT_LANGUAGE = "javascript";
[_bash.default, _cpp.default, _css.default, _clike.default, _csharp.default, _docker.default, _elixir.default, _erlang.default, _go.default, _graphql.default, _groovy.default, _haskell.default, _hcl.default, _ini.default, _java.default, _javascript.default, _jsx.default, _json.default, _kotlin.default, _lisp.default, _lua.default, _markup.default, _mermaid.default, _nginx.default, _nix.default, _objectivec.default, _ocaml.default, _perl.default, _php.default, _python.default, _powershell.default, _protobuf.default, _r.default, _ruby.default, _rust.default, _scala.default, _sql.default, _solidity.default, _sass.default, _scss.default, _swift.default, _toml.default, _typescript.default, _tsx.default, _verilog.default, _vhdl.default, _visualBasic.default, _yaml.default, _zig.default].forEach(_core.default.register);
class CodeFence extends _Node.default {
  constructor(options) {
    super(options);
  }
  get showLineNumbers() {
    return this.options.userPreferences?.codeBlockLineNumbers ?? true;
  }
  get name() {
    return "code_fence";
  }
  get schema() {
    return {
      attrs: {
        language: {
          default: DEFAULT_LANGUAGE,
          validate: "string"
        }
      },
      content: "text*",
      marks: "comment",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [{
        tag: "code"
      }, {
        tag: "pre",
        preserveWhitespace: "full"
      }, {
        tag: ".code-block",
        preserveWhitespace: "full",
        contentElement: node => node.querySelector("code") || node,
        getAttrs: dom => ({
          language: dom.dataset.language
        })
      }],
      toDOM: node => ["div", {
        class: `code-block ${this.showLineNumbers ? "with-line-numbers" : ""}`,
        "data-language": node.attrs.language
      }, ["pre", ["code", {
        spellCheck: "false"
      }, 0]]]
    };
  }
  commands(_ref) {
    let {
      type,
      schema
    } = _ref;
    return {
      code_block: attrs => {
        if (attrs?.language) {
          (0, _code.setRecentCodeLanguage)(attrs.language);
        }
        return (0, _toggleBlockType.default)(type, schema.nodes.paragraph, {
          language: (0, _code.getRecentCodeLanguage)() ?? DEFAULT_LANGUAGE,
          ...attrs
        });
      },
      copyToClipboard: () => (state, dispatch) => {
        const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
        if (codeBlock) {
          (0, _copyToClipboard.default)(codeBlock.node.textContent);
          _sonner.toast.message(this.options.dictionary.codeCopied);
          return true;
        }
        const {
          doc,
          tr
        } = state;
        const range = (0, _getMarkRange.getMarkRange)(doc.resolve(state.selection.from), this.editor.schema.marks.code_inline) || (0, _getMarkRange.getMarkRange)(doc.resolve(state.selection.to), this.editor.schema.marks.code_inline);
        if (range) {
          const $end = doc.resolve(range.to);
          tr.setSelection(new _prosemirrorState.TextSelection($end, $end));
          dispatch?.(tr);
          (0, _copyToClipboard.default)(tr.doc.textBetween(state.selection.from, state.selection.to));
          _sonner.toast.message(this.options.dictionary.codeCopied);
          return true;
        }
        return false;
      }
    };
  }
  get allowInReadOnly() {
    return true;
  }
  keys(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    const output = {
      // Both shortcuts work, but Shift-Ctrl-c matches the one in the menu
      "Shift-Ctrl-c": (0, _toggleBlockType.default)(type, schema.nodes.paragraph),
      "Shift-Ctrl-\\": (0, _toggleBlockType.default)(type, schema.nodes.paragraph),
      "Shift-Tab": _codeFence.outdentInCode,
      Tab: _codeFence.indentInCode,
      Enter: _codeFence.enterInCode,
      Backspace: (0, _backspaceToParagraph.default)(type),
      "Shift-Enter": _codeFence.newlineInCode,
      "Mod-a": (0, _selectAll.selectAll)(type),
      "Mod-]": _codeFence.indentInCode,
      "Mod-[": _codeFence.outdentInCode
    };
    if ((0, _browser.isMac)()) {
      return {
        ...output,
        "Ctrl-a": _codeFence.moveToPreviousNewline,
        "Ctrl-e": _codeFence.moveToNextNewline
      };
    }
    return output;
  }
  get plugins() {
    return [(0, _Prism.default)({
      name: this.name,
      lineNumbers: this.showLineNumbers
    }), (0, _Mermaid.default)({
      name: this.name,
      isDark: this.editor.props.theme.isDark
    }), new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("triple-click"),
      props: {
        handleDOMEvents: {
          mousedown(view, event) {
            const {
              dispatch,
              state
            } = view;
            const {
              selection: {
                $from,
                $to
              }
            } = state;
            if ($from.sameParent($to) && event.detail === 3 && (0, _isInCode.isInCode)(view.state, {
              onlyBlock: true
            })) {
              dispatch?.(state.tr.setSelection(_prosemirrorState.TextSelection.create(state.doc, (0, _findNewlines.findPreviousNewline)($from), (0, _findNewlines.findNextNewline)($from))).scrollIntoView());
              event.preventDefault();
              return true;
            }
            return false;
          }
        }
      }
    }), new _prosemirrorState.Plugin({
      props: {
        decorations(state) {
          const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
          if (!codeBlock) {
            return null;
          }
          const decoration = _prosemirrorView.Decoration.node(codeBlock.pos, codeBlock.pos + codeBlock.node.nodeSize, {
            class: "code-active"
          });
          return _prosemirrorView.DecorationSet.create(state.doc, [decoration]);
        }
      }
    })];
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [(0, _prosemirrorInputrules.textblockTypeInputRule)(/^```$/, type, () => ({
      language: (0, _code.getRecentCodeLanguage)() ?? DEFAULT_LANGUAGE
    }))];
  }
  toMarkdown(state, node) {
    state.write("```" + (node.attrs.language || "") + "\n");
    state.text(node.textContent, false);
    state.ensureNewLine();
    state.write("```");
    state.closeBlock(node);
  }
  get markdownToken() {
    return "fence";
  }
  parseMarkdown() {
    return {
      block: "code_block",
      getAttrs: tok => ({
        language: tok.info
      })
    };
  }
}
exports.default = CodeFence;