"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArg = getArg;
/**
 * Get the value of a command line argument
 *
 * @param name The name of the argument
 * @param shortName The optioanl short name
 * @returns The value of the argument or undefined if the argument is not present
 */
function getArg(name, shortName) {
  const argument = process.argv.slice(2).filter(arg => arg === `--${name}` || arg.startsWith(`--${name}=`) || shortName && arg.startsWith(`-${shortName}=`)).map(arg => arg.split("=")[1] ?? "true").map(arg => arg.trim()).join(",");
  return argument || undefined;
}