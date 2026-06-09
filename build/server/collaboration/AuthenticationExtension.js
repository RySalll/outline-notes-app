"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _tracing = require("./../logging/tracing");
var _Document = _interopRequireDefault(require("./../models/Document"));
var _policies = require("./../policies");
var _jwt = require("./../utils/jwt");
var _errors = require("../errors");
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let AuthenticationExtension = exports.default = (_dec = (0, _tracing.trace)(), _dec(_class = class AuthenticationExtension {
  async onAuthenticate(_ref) {
    let {
      connection,
      token,
      documentName
    } = _ref;
    // allows for different entity types to use this multiplayer provider later
    const [, documentId] = documentName.split(".");
    if (!token) {
      throw (0, _errors.AuthenticationError)("Authentication required");
    }
    const user = await (0, _jwt.getUserForJWT)(token, ["session", "collaboration"]);
    if (user.isSuspended) {
      throw (0, _errors.AuthenticationError)("Account suspended");
    }
    const document = await _Document.default.findByPk(documentId, {
      userId: user.id
    });
    if (!(0, _policies.can)(user, "read", document)) {
      throw (0, _errors.AuthenticationError)("Authorization required");
    }

    // set document to read only for the current user, thus changes will not be
    // accepted and synced to other clients
    if (!(0, _policies.can)(user, "update", document)) {
      connection.readOnly = true;
    }
    return {
      user
    };
  }
}) || _class);