"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class TrailingNode extends _Extension.default {
  get name() {
    return "trailing_node";
  }
  get defaultOptions() {
    return {
      node: "paragraph",
      notAfter: ["paragraph", "heading"]
    };
  }
  get plugins() {
    const plugin = new _prosemirrorState.PluginKey(this.name);
    const disabledNodes = Object.entries(this.editor.schema.nodes).map(_ref => {
      let [, value] = _ref;
      return value;
    }).filter(node => this.options.notAfter.includes(node.name));
    return [new _prosemirrorState.Plugin({
      key: plugin,
      view: () => ({
        update: view => {
          const {
            state
          } = view;
          const insertNodeAtEnd = plugin.getState(state);
          if (!insertNodeAtEnd) {
            return;
          }
          const {
            doc,
            schema,
            tr
          } = state;
          const type = schema.nodes[this.options.node];
          const transaction = tr.insert(doc.content.size, type.create());
          view.dispatch(transaction);
        }
      }),
      state: {
        init: (_, state) => {
          const lastNode = state.tr.doc.lastChild;
          return lastNode ? !disabledNodes.includes(lastNode.type) : false;
        },
        apply: (tr, value) => {
          if (!tr.docChanged) {
            return value;
          }
          const lastNode = tr.doc.lastChild;
          return lastNode ? !disabledNodes.includes(lastNode.type) : false;
        }
      }
    })];
  }
}
exports.default = TrailingNode;