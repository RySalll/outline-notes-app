"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TaskSchedule = exports.TaskPriority = void 0;
var _ = require("../");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let TaskPriority = exports.TaskPriority = /*#__PURE__*/function (TaskPriority) {
  TaskPriority[TaskPriority["Background"] = 40] = "Background";
  TaskPriority[TaskPriority["Low"] = 30] = "Low";
  TaskPriority[TaskPriority["Normal"] = 20] = "Normal";
  TaskPriority[TaskPriority["High"] = 10] = "High";
  return TaskPriority;
}({});
let TaskSchedule = exports.TaskSchedule = /*#__PURE__*/function (TaskSchedule) {
  TaskSchedule["Daily"] = "daily";
  TaskSchedule["Hourly"] = "hourly";
  return TaskSchedule;
}({});
class BaseTask {
  /**
   * Schedule this task type to be processed asyncronously by a worker.
   *
   * @param props Properties to be used by the task
   * @returns A promise that resolves once the job is placed on the task queue
   */
  static schedule(props, options) {
    // @ts-expect-error cannot create an instance of an abstract class, we wont
    const task = new this();
    return _.taskQueue.add({
      name: this.name,
      props
    }, {
      ...options,
      ...task.options
    });
  }

  /**
   * Execute the task.
   *
   * @param props Properties to be used by the task
   * @returns A promise that resolves once the task has completed.
   */

  /**
   * Job options such as priority and retry strategy, as defined by Bull.
   */
  get options() {
    return {
      priority: TaskPriority.Normal,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 60 * 1000
      }
    };
  }
}
exports.default = BaseTask;
/**
 * An optional schedule for this task to be run automatically.
 */
_defineProperty(BaseTask, "cron", void 0);