"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.websocketQueue = exports.taskQueue = exports.processorEventQueue = exports.globalEventQueue = void 0;
var _queue = require("./queue");
const globalEventQueue = exports.globalEventQueue = (0, _queue.createQueue)("globalEvents", {
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 1000
  }
});
const processorEventQueue = exports.processorEventQueue = (0, _queue.createQueue)("processorEvents", {
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 10 * 1000
  }
});
const websocketQueue = exports.websocketQueue = (0, _queue.createQueue)("websockets", {
  timeout: 10 * 1000
});
const taskQueue = exports.taskQueue = (0, _queue.createQueue)("tasks", {
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 10 * 1000
  }
});