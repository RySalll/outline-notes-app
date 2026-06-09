"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;
// Note: This entire object is stringified in the HTML exposed to the client
// do not add anything here that should be a secret or password
function present(env) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    ROOT_SHARE_ID: options.rootShareId || undefined,
    analytics: (options.analytics ?? []).map(integration => ({
      service: integration?.service,
      settings: integration?.settings
    })),
    ...env.public
  };
}