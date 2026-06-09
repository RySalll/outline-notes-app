"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _types = require("./../../../shared/types");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class ErrorTimedOutFileOperationsTask extends _BaseTask.default {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    _Logger.default.info("task", `Error file operations running longer than 12 hours…`);
    const fileOperations = await _models.FileOperation.unscoped().findAll({
      where: {
        createdAt: {
          [_sequelize.Op.lt]: (0, _dateFns.subHours)(new Date(), 12)
        },
        [_sequelize.Op.or]: [{
          state: _types.FileOperationState.Creating
        }, {
          state: _types.FileOperationState.Uploading
        }]
      },
      limit
    });
    await Promise.all(fileOperations.map(async fileOperation => {
      fileOperation.state = _types.FileOperationState.Error;
      fileOperation.error = "Timed out";
      await fileOperation.save({
        hooks: false
      });
    }));
    _Logger.default.info("task", `Updated ${fileOperations.length} file operations`);
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = ErrorTimedOutFileOperationsTask;
_defineProperty(ErrorTimedOutFileOperationsTask, "cron", _BaseTask.TaskSchedule.Daily);