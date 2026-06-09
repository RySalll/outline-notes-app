"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LANGUAGES = void 0;
exports.default = Prism;
var _flattenDeep = _interopRequireDefault(require("lodash/flattenDeep"));
var _padStart = _interopRequireDefault(require("lodash/padStart"));
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _core = _interopRequireDefault(require("refractor/core"));
var _multiplayer = require("../lib/multiplayer");
var _findChildren = require("../queries/findChildren");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LANGUAGES = exports.LANGUAGES = {
  none: "Plain text",
  // additional entry to disable highlighting
  bash: "Bash",
  clike: "C",
  cpp: "C++",
  csharp: "C#",
  css: "CSS",
  docker: "Docker",
  elixir: "Elixir",
  erlang: "Erlang",
  go: "Go",
  graphql: "GraphQL",
  groovy: "Groovy",
  haskell: "Haskell",
  hcl: "HCL",
  markup: "HTML",
  ini: "INI",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  kotlin: "Kotlin",
  lisp: "Lisp",
  lua: "Lua",
  mermaidjs: "Mermaid Diagram",
  nginx: "Nginx",
  nix: "Nix",
  objectivec: "Objective-C",
  ocaml: "OCaml",
  perl: "Perl",
  php: "PHP",
  powershell: "Powershell",
  protobuf: "Protobuf",
  python: "Python",
  r: "R",
  ruby: "Ruby",
  rust: "Rust",
  scala: "Scala",
  sass: "Sass",
  scss: "SCSS",
  sql: "SQL",
  solidity: "Solidity",
  swift: "Swift",
  toml: "TOML",
  tsx: "TSX",
  typescript: "TypeScript",
  vb: "Visual Basic",
  verilog: "Verilog",
  vhdl: "VHDL",
  yaml: "YAML",
  zig: "Zig"
};
const cache = {};
function getDecorations(_ref) {
  let {
    doc,
    name,
    lineNumbers
  } = _ref;
  const decorations = [];
  const blocks = (0, _findChildren.findBlockNodes)(doc, true).filter(item => item.node.type.name === name);
  function parseNodes(nodes) {
    let classNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    return (0, _flattenDeep.default)(nodes.map(node => {
      if (node.type === "element") {
        const classes = [...classNames, ...(node.properties.className || [])];
        return parseNodes(node.children, classes);
      }
      return {
        text: node.value,
        classes: classNames
      };
    }));
  }
  blocks.forEach(block => {
    let startPos = block.pos + 1;
    const language = block.node.attrs.language === "mermaidjs" ? "mermaid" : block.node.attrs.language;
    if (!language || language === "none" || !_core.default.registered(language)) {
      return;
    }
    const lineDecorations = [];
    if (!cache[block.pos] || !cache[block.pos].node.eq(block.node)) {
      if (lineNumbers) {
        const lineCount = (block.node.textContent.match(/\n/g) || []).length + 1;
        const gutterWidth = String(lineCount).length;
        const lineCountText = new Array(lineCount).fill(0).map((_, i) => (0, _padStart.default)(`${i + 1}`, gutterWidth, " ")).join("\n");
        lineDecorations.push(_prosemirrorView.Decoration.node(block.pos, block.pos + block.node.nodeSize, {
          "data-line-numbers": `${lineCountText}`,
          style: `--line-number-gutter-width: ${gutterWidth};`
        }, {
          key: `line-${lineCount}-gutter`
        }));
      }
      const nodes = _core.default.highlight(block.node.textContent, language);
      const newDecorations = parseNodes(nodes).map(node => {
        const from = startPos;
        const to = from + node.text.length;
        startPos = to;
        return {
          ...node,
          from,
          to
        };
      }).filter(node => node.classes && node.classes.length).map(node => _prosemirrorView.Decoration.inline(node.from, node.to, {
        class: node.classes.join(" ")
      })).concat(lineDecorations);
      cache[block.pos] = {
        node: block.node,
        decorations: newDecorations
      };
    }
    cache[block.pos].decorations.forEach(decoration => {
      decorations.push(decoration);
    });
  });
  Object.keys(cache).filter(pos => !blocks.find(block => block.pos === Number(pos))).forEach(pos => {
    delete cache[Number(pos)];
  });
  return _prosemirrorView.DecorationSet.create(doc, decorations);
}
function Prism(_ref2) {
  let {
    name,
    lineNumbers
  } = _ref2;
  let highlighted = false;
  return new _prosemirrorState.Plugin({
    key: new _prosemirrorState.PluginKey("prism"),
    state: {
      init: (_, _ref3) => {
        let {
          doc
        } = _ref3;
        return _prosemirrorView.DecorationSet.create(doc, []);
      },
      apply: (transaction, decorationSet, oldState, state) => {
        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged = transaction.docChanged && [nodeName, previousNodeName].includes(name);

        // @ts-expect-error accessing private field.
        const isPaste = transaction.meta?.paste;
        if (!highlighted || codeBlockChanged || isPaste || (0, _multiplayer.isRemoteTransaction)(transaction)) {
          highlighted = true;
          return getDecorations({
            doc: transaction.doc,
            name,
            lineNumbers
          });
        }
        return decorationSet.map(transaction.mapping, transaction.doc);
      }
    },
    view: view => {
      if (!highlighted) {
        // we don't highlight code blocks on the first render as part of mounting
        // as it's expensive (relative to the rest of the document). Instead let
        // it render un-highlighted and then trigger a defered render of Prism
        // by updating the plugins metadata
        setTimeout(() => {
          if (!view.isDestroyed) {
            view.dispatch(view.state.tr.setMeta("prism", {
              loaded: true
            }));
          }
        }, 10);
      }
      return {};
    },
    props: {
      decorations(state) {
        return this.getState(state);
      }
    }
  });
}