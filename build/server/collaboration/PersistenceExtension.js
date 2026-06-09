"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var Y = _interopRequireWildcard(require("yjs"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _tracing = require("./../logging/tracing");
var _Document = _interopRequireDefault(require("./../models/Document"));
var _ProsemirrorHelper = require("./../models/helpers/ProsemirrorHelper");
var _database = require("./../storage/database");
var _documentCollaborativeUpdater = _interopRequireDefault(require("../commands/documentCollaborativeUpdater"));
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let PersistenceExtension = exports.default = (_dec = (0, _tracing.trace)(), _dec(_class = class PersistenceExtension {
  constructor() {
    /**
     * Map of documentId -> userIds that have modified the document since it
     * was last persisted to the database. The map is cleared on every save.
     */
    _defineProperty(this, "documentCollaboratorIds", new Map());
  }
  async onLoadDocument(_ref) {
    let {
      documentName,
      ...data
    } = _ref;
    const [, documentId] = documentName.split(".");
    const fieldName = "default";

    // Check if the given field already exists in the given y-doc. This is import
    // so we don't import a document fresh if it exists already.
    if (!data.document.isEmpty(fieldName)) {
      return;
    }
    return await _database.sequelize.transaction(async transaction => {
      const document = await _Document.default.scope("withState").findOne({
        transaction,
        lock: transaction.LOCK.UPDATE,
        rejectOnEmpty: true,
        where: {
          id: documentId
        }
      });
      let ydoc;
      if (document.state) {
        ydoc = new Y.Doc();
        _Logger.default.info("database", `Document ${documentId} is in database state`);
        Y.applyUpdate(ydoc, document.state);
        return ydoc;
      }
      if (document.content) {
        _Logger.default.info("database", `Document ${documentId} is not in state, creating from content`);
        ydoc = _ProsemirrorHelper.ProsemirrorHelper.toYDoc(document.content, fieldName);
      } else {
        _Logger.default.info("database", `Document ${documentId} is not in state, creating from text`);
        ydoc = _ProsemirrorHelper.ProsemirrorHelper.toYDoc(document.text, fieldName);
      }
      const state = _ProsemirrorHelper.ProsemirrorHelper.toState(ydoc);
      await document.update({
        state
      }, {
        silent: true,
        hooks: false,
        transaction
      });
      return ydoc;
    });
  }
  async onChange(_ref2) {
    let {
      context,
      documentName
    } = _ref2;
    _Logger.default.debug("multiplayer", `${context.user?.name} changed ${documentName}`);
    const state = this.documentCollaboratorIds.get(documentName) ?? new Set();
    if (context.user) {
      state.add(context.user.id);
    }
    this.documentCollaboratorIds.set(documentName, state);
  }
  async onStoreDocument(_ref3) {
    let {
      document,
      context,
      documentName,
      clientsCount
    } = _ref3;
    const [, documentId] = documentName.split(".");

    // Find the collaborators that have modified the document since it was last
    // persisted and clear the map, if there's no collaborators then we don't
    // need to persist the document.
    const documentCollaboratorIds = this.documentCollaboratorIds.get(documentName);
    if (!documentCollaboratorIds) {
      _Logger.default.debug("multiplayer", `No changes for ${documentName}`);
      return;
    }
    const sessionCollaboratorIds = Array.from(documentCollaboratorIds.values());
    this.documentCollaboratorIds.delete(documentName);
    try {
      await (0, _documentCollaborativeUpdater.default)({
        documentId,
        ydoc: document,
        sessionCollaboratorIds,
        isLastConnection: clientsCount === 0
      });
    } catch (err) {
      _Logger.default.error("Unable to persist document", err, {
        documentId,
        userId: context.user?.id
      });
    }
  }
}) || _class);