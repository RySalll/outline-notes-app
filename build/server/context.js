"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContext = createContext;
var _types = require("./types");
function createContext(_ref) {
  let {
    user,
    authType = _types.AuthenticationType.APP,
    ip,
    transaction
  } = _ref;
  return {
    context: {
      auth: {
        user,
        type: authType
      },
      ip: ip ?? user.lastActiveIp,
      transaction
    }
  };
}