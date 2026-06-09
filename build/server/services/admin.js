"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _api = require("@bull-board/api");
var _bullAdapter = require("@bull-board/api/bullAdapter");
var _koa = require("@bull-board/koa");
var _queues = require("../queues");
function init(app) {
  const serverAdapter = new _koa.KoaAdapter();
  (0, _api.createBullBoard)({
    queues: [new _bullAdapter.BullAdapter(_queues.globalEventQueue), new _bullAdapter.BullAdapter(_queues.processorEventQueue), new _bullAdapter.BullAdapter(_queues.websocketQueue), new _bullAdapter.BullAdapter(_queues.taskQueue)],
    serverAdapter
  });
  serverAdapter.setBasePath("/admin");
  app.use(serverAdapter.registerPlugin());
}