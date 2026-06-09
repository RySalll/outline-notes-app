"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _tracer = require("./../logging/tracer");
var _tracing = require("./../logging/tracing");
var _HealthMonitor = _interopRequireDefault(require("./../queues/HealthMonitor"));
var _i18n = require("./../utils/i18n");
var _queues = require("../queues");
var _processors = _interopRequireDefault(require("../queues/processors"));
var _tasks = _interopRequireDefault(require("../queues/tasks"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function init() {
  void (0, _i18n.initI18n)();

  // This queue processes the global event bus
  _queues.globalEventQueue.process(_env.default.WORKER_CONCURRENCY_EVENTS, (0, _tracing.traceFunction)({
    serviceName: "worker",
    spanName: "process",
    isRoot: true
  })(async function (job) {
    const event = job.data;
    let err;
    (0, _tracer.setResource)(`Event.${event.name}`);
    _Logger.default.info("worker", `Processing ${event.name}`, {
      event,
      attempt: job.attemptsMade
    });

    // For each registered processor we check to see if it wants to handle the
    // event (applicableEvents), and if so add a new queued job specifically
    // for that processor.
    for (const name in _processors.default) {
      const ProcessorClass = _processors.default[name];
      if (!ProcessorClass) {
        throw new Error(`Received event "${event.name}" for processor (${name}) that isn't registered. Check the file name matches the class name.`);
      }
      try {
        if (name === "WebsocketsProcessor") {
          // websockets are a special case on their own queue because they must
          // only be consumed by the websockets service rather than workers.
          await _queues.websocketQueue.add(job.data);
        } else if (ProcessorClass.applicableEvents.includes(event.name) || ProcessorClass.applicableEvents.includes("*")) {
          await _queues.processorEventQueue.add({
            event,
            name
          });
        }
      } catch (error) {
        _Logger.default.error(`Error adding ${event.name} to ${name} queue`, error, event);
        err = error;
      }
    }
    if (err) {
      throw err;
    }
  })).catch(err => {
    _Logger.default.fatal("Error starting globalEventQueue", err);
  });

  // Jobs for individual processors are processed here. Only applicable events
  // as unapplicable events were filtered in the global event queue above.
  _queues.processorEventQueue.process(_env.default.WORKER_CONCURRENCY_EVENTS, (0, _tracing.traceFunction)({
    serviceName: "worker",
    spanName: "process",
    isRoot: true
  })(async function (job) {
    const {
      event,
      name
    } = job.data;
    const ProcessorClass = _processors.default[name];
    (0, _tracer.setResource)(`Processor.${name}`);
    (0, _tracer.addTags)({
      event
    });
    if (!ProcessorClass) {
      throw new Error(`Received event "${event.name}" for processor (${name}) that isn't registered. Check the file name matches the class name.`);
    }

    // @ts-expect-error We will not instantiate an abstract class
    const processor = new ProcessorClass();
    if (processor.perform) {
      _Logger.default.info("worker", `${name} running ${event.name}`, {
        event
      });
      try {
        await processor.perform(event);
      } catch (err) {
        _Logger.default.error(`Error processing ${event.name} in ${name}`, err, event);
        throw err;
      }
    }
  })).catch(err => {
    _Logger.default.fatal("Error starting processorEventQueue", err);
  });

  // Jobs for async tasks are processed here.
  _queues.taskQueue.process(_env.default.WORKER_CONCURRENCY_TASKS, (0, _tracing.traceFunction)({
    serviceName: "worker",
    spanName: "process",
    isRoot: true
  })(async function (job) {
    const {
      name,
      props
    } = job.data;
    const TaskClass = _tasks.default[name];
    (0, _tracer.setResource)(`Task.${name}`);
    (0, _tracer.addTags)({
      props
    });
    if (!TaskClass) {
      throw new Error(`Task "${name}" is not registered. Check the file name matches the class name.`);
    }
    _Logger.default.info("worker", `${name} running`, props);

    // @ts-expect-error We will not instantiate an abstract class
    const task = new TaskClass();
    try {
      return await task.perform(props);
    } catch (err) {
      _Logger.default.error(`Error processing task in ${name}`, err, props);
      throw err;
    }
  })).catch(err => {
    _Logger.default.fatal("Error starting taskQueue", err);
  });
  _HealthMonitor.default.start(_queues.globalEventQueue);
  _HealthMonitor.default.start(_queues.processorEventQueue);
  _HealthMonitor.default.start(_queues.taskQueue);
}