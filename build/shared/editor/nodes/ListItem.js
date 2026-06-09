"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorSchemaList = require("prosemirror-schema-list");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _findParentNode = require("../queries/findParentNode");
var _getParentListItem = require("../queries/getParentListItem");
var _isInList = require("../queries/isInList");
var _isList = require("../queries/isList");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ListItem extends _Node.default {
  get name() {
    return "list_item";
  }
  get schema() {
    return {
      content: "paragraph block*",
      defining: true,
      draggable: true,
      parseDOM: [{
        tag: "li"
      }],
      toDOM: () => ["li", 0]
    };
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      state: {
        init() {
          return _prosemirrorView.DecorationSet.empty;
        },
        apply: (tr, set, oldState, newState) => {
          const action = tr.getMeta("li");
          if (!action && !tr.docChanged) {
            return set;
          }

          // Adjust decoration positions to changes made by the transaction
          set = set.map(tr.mapping, tr.doc);
          switch (action?.event) {
            case "mouseover":
              {
                const result = (0, _findParentNode.findParentNodeClosestToPos)(newState.doc.resolve(action.pos), node => node.type.name === this.name || node.type.name === "checkbox_item");
                if (!result) {
                  return set;
                }
                const list = (0, _findParentNode.findParentNodeClosestToPos)(newState.doc.resolve(action.pos), node => (0, _isList.isList)(node, this.editor.schema));
                if (!list) {
                  return set;
                }
                const start = list.node.attrs.order || 1;
                let listItemNumber = 0;
                list.node.content.forEach((li, _, index) => {
                  if (li === result.node) {
                    listItemNumber = index;
                  }
                });
                const counterLength = String(start + listItemNumber).length;
                return set.add(tr.doc, [_prosemirrorView.Decoration.node(result.pos, result.pos + result.node.nodeSize, {
                  class: `hovering`
                }, {
                  hover: true
                }), _prosemirrorView.Decoration.node(result.pos, result.pos + result.node.nodeSize, {
                  class: `counter-${counterLength}`
                })]);
              }
            case "mouseout":
              {
                const result = (0, _findParentNode.findParentNodeClosestToPos)(newState.doc.resolve(action.pos), node => node.type.name === this.name || node.type.name === "checkbox_item");
                if (!result) {
                  return set;
                }
                return set.remove(set.find(result.pos, result.pos + result.node.nodeSize, spec => spec.hover));
              }
            default:
          }
          return set;
        }
      },
      props: {
        decorations(state) {
          return this.getState(state);
        },
        handleDOMEvents: {
          mouseover: (view, event) => {
            if (!view.editable) {
              return false;
            }
            const {
              state,
              dispatch
            } = view;
            const target = event.target;
            const li = target?.closest("li");
            if (!li) {
              return false;
            }
            if (!view.dom.contains(li)) {
              return false;
            }
            const pos = view.posAtDOM(li, 0);
            if (!pos) {
              return false;
            }
            dispatch(state.tr.setMeta("li", {
              event: "mouseover",
              pos
            }));
            return false;
          },
          mouseout: (view, event) => {
            if (!view.editable) {
              return false;
            }
            const {
              state,
              dispatch
            } = view;
            const target = event.target;
            const li = target?.closest("li");
            if (!li) {
              return false;
            }
            if (!view.dom.contains(li)) {
              return false;
            }
            const pos = view.posAtDOM(li, 0);
            if (!pos) {
              return false;
            }
            dispatch(state.tr.setMeta("li", {
              event: "mouseout",
              pos
            }));
            return false;
          }
        }
      }
    })];
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return {
      indentList: () => (0, _prosemirrorSchemaList.sinkListItem)(type),
      outdentList: () => (0, _prosemirrorSchemaList.liftListItem)(type)
    };
  }
  keys(_ref2) {
    let {
      type
    } = _ref2;
    return {
      Enter: (0, _prosemirrorSchemaList.splitListItem)(type),
      Tab: (0, _prosemirrorSchemaList.sinkListItem)(type),
      "Shift-Tab": (0, _prosemirrorSchemaList.liftListItem)(type),
      "Mod-]": (0, _prosemirrorSchemaList.sinkListItem)(type),
      "Mod-[": (0, _prosemirrorSchemaList.liftListItem)(type),
      "Shift-Enter": (state, dispatch) => {
        if (!(0, _isInList.isInList)(state)) {
          return false;
        }
        if (!state.selection.empty) {
          return false;
        }
        const {
          tr,
          selection
        } = state;
        dispatch?.(tr.split(selection.to));
        return true;
      },
      "Alt-ArrowUp": (state, dispatch) => {
        if (!state.selection.empty) {
          return false;
        }
        const result = (0, _getParentListItem.getParentListItem)(state);
        if (!result) {
          return false;
        }
        const [li, pos] = result;
        const $pos = state.doc.resolve(pos);
        if (!$pos.nodeBefore || !["list_item", "checkbox_item"].includes($pos.nodeBefore.type.name)) {
          return false;
        }
        const {
          tr
        } = state;
        const newPos = pos - $pos.nodeBefore.nodeSize;
        dispatch?.(tr.delete(pos, pos + li.nodeSize).insert(newPos, li).setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(newPos))));
        return true;
      },
      "Alt-ArrowDown": (state, dispatch) => {
        if (!state.selection.empty) {
          return false;
        }
        const result = (0, _getParentListItem.getParentListItem)(state);
        if (!result) {
          return false;
        }
        const [li, pos] = result;
        const $pos = state.doc.resolve(pos + li.nodeSize);
        if (!$pos.nodeAfter || !["list_item", "checkbox_item"].includes($pos.nodeAfter.type.name)) {
          return false;
        }
        const {
          tr
        } = state;
        const newPos = pos + li.nodeSize + $pos.nodeAfter.nodeSize;
        dispatch?.(tr.insert(newPos, li).setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(newPos))).delete(pos, pos + li.nodeSize));
        return true;
      }
    };
  }
  toMarkdown(state, node) {
    state.renderContent(node);
  }
  parseMarkdown() {
    return {
      block: "list_item"
    };
  }
}
exports.default = ListItem;