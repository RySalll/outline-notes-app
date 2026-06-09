"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseEmail = parseEmail;
/**
 * Parse an email address into its local and domain parts.
 *
 * @param email The email address to parse
 * @returns The local and domain parts of the email address, in lowercase
 */
function parseEmail(email) {
  const [local, domain] = email.toLowerCase().split("@");
  if (!domain) {
    throw new Error("Invalid email address");
  }
  return {
    local,
    domain
  };
}