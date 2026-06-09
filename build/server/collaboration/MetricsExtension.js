"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Metrics = _interopRequireDefault(require("./../logging/Metrics"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class MetricsExtension {
  async onLoadDocument(_ref) {
    let {
      documentName,
      instance
    } = _ref;
    _Metrics.default.increment("collaboration.load_document", {
      documentName
    });
    _Metrics.default.gaugePerInstance("collaboration.documents_count", instance.getDocumentsCount());
  }
  onAuthenticationFailed(_ref2) {
    let {
      documentName
    } = _ref2;
    _Metrics.default.increment("collaboration.authentication_failed", {
      documentName
    });
  }
  async connected(_ref3) {
    let {
      documentName,
      instance
    } = _ref3;
    _Metrics.default.increment("collaboration.connect", {
      documentName
    });
    _Metrics.default.gaugePerInstance("collaboration.connections_count", instance.getConnectionsCount() + 1);
    _Metrics.default.gaugePerInstance("collaboration.documents_count", instance.getDocumentsCount());
  }
  async onDisconnect(_ref4) {
    let {
      documentName,
      instance
    } = _ref4;
    _Metrics.default.increment("collaboration.disconnect", {
      documentName
    });
    _Metrics.default.gaugePerInstance("collaboration.connections_count", instance.getConnectionsCount());
    _Metrics.default.gaugePerInstance("collaboration.documents_count", instance.getDocumentsCount());
  }
  async onStoreDocument(_ref5) {
    let {
      documentName
    } = _ref5;
    _Metrics.default.increment("collaboration.change", {
      documentName
    });
  }
  async onDestroy() {
    _Metrics.default.gaugePerInstance("collaboration.connections_count", 0);
    _Metrics.default.gaugePerInstance("collaboration.documents_count", 0);
  }
}
exports.default = MetricsExtension;