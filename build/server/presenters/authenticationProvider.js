"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentAuthenticationProvider;
function presentAuthenticationProvider(authenticationProvider) {
  return {
    id: authenticationProvider.id,
    name: authenticationProvider.name,
    createdAt: authenticationProvider.createdAt,
    isEnabled: authenticationProvider.enabled,
    isConnected: true
  };
}