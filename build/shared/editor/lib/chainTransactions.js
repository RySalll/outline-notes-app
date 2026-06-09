"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chainTransactions = chainTransactions;
/**
 * Chain multiple commands into a single command and collects state as it goes.
 *
 * @param commands The commands to chain
 * @returns The chained command
 */
function chainTransactions() {
  for (var _len = arguments.length, commands = new Array(_len), _key = 0; _key < _len; _key++) {
    commands[_key] = arguments[_key];
  }
  return (state, dispatch) => {
    const dispatcher = tr => {
      state = state.apply(tr);
      dispatch?.(tr);
    };
    const last = commands.pop();
    commands.map(command => command?.(state, dispatcher));
    return last !== undefined && last(state, dispatch);
  };
}