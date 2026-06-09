"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Placeholder extends _Extension.default {
  get name() {
    return "empty-placeholder";
  }
  get defaultOptions() {
    return {
      emptyNodeClass: "placeholder",
      placeholder: ""
    };
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      props: {
        decorations: state => {
          const {
            doc
          } = state;
          const decorations = [];
          const completelyEmpty = doc.childCount <= 1 && doc.content.size <= 2 && doc.textContent === "";
          if (completelyEmpty) {
            doc.descendants((node, pos) => {
              if (pos !== 0 || node.type.name !== "paragraph") {
                return;
              }
              const decoration = _prosemirrorView.Decoration.node(pos, pos + node.nodeSize, {
                class: this.options.emptyNodeClass,
                "data-empty-text": this.options.placeholder
              });
              decorations.push(decoration);
            });
          }
          return _prosemirrorView.DecorationSet.create(doc, decorations);
        }
      }
    })];
  }
}
exports.default = Placeholder;