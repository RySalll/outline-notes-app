"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class LoggerExtension {
  async onLoadDocument(data) {
    _Logger.default.info("multiplayer", `Loaded document "${data.documentName}"`, {
      userId: data.context.user?.id
    });
  }
  async onConnect(data) {
    _Logger.default.info("multiplayer", `New connection to "${data.documentName}"`);
  }
  async connected(data) {
    _Logger.default.info("multiplayer", `Authenticated connection to "${data.documentName}"`);
  }
  async onDisconnect(data) {
    _Logger.default.info("multiplayer", `Closed connection to "${data.documentName}"`, {
      userId: data.context.user?.id
    });
  }
}
exports.default = LoggerExtension;