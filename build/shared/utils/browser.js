"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBrowser = void 0;
exports.isMac = isMac;
exports.isTouchDevice = isTouchDevice;
exports.isWindows = isWindows;
exports.supportsPassiveListener = void 0;
/**
 * Returns true if we're running in the browser.
 */
const isBrowser = exports.isBrowser = typeof window !== "undefined";

/**
 * Returns true if the client is a touch device.
 */
function isTouchDevice() {
  if (!isBrowser) {
    return false;
  }
  return window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches;
}

/**
 * Returns true if the client is running on a Mac.
 */
function isMac() {
  if (!isBrowser) {
    return false;
  }
  return window.navigator.platform === "MacIntel";
}

/**
 * Returns true if the client is running on Windows.
 */
function isWindows() {
  if (!isBrowser) {
    return false;
  }
  return window.navigator.platform === "Win32";
}
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, "passive", {
    get() {
      supportsPassive = true;
    }
  });
  // @ts-expect-error ts-migrate(2769) testPassive is not a real event
  window.addEventListener("testPassive", null, opts);
  // @ts-expect-error ts-migrate(2769) testPassive is not a real event
  window.removeEventListener("testPassive", null, opts);
} catch (e) {
  // No-op
}

/**
 * Returns true if the client supports passive event listeners
 */
const supportsPassiveListener = exports.supportsPassiveListener = supportsPassive;