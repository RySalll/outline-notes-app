"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _models = require("./../../models");
var _database = require("./../../storage/database");
var _BaseTask = _interopRequireWildcard(require("./BaseTask"));
var _UpdateTeamAttachmentsSizeTask = _interopRequireDefault(require("./UpdateTeamAttachmentsSizeTask"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class UpdateTeamsAttachmentsSizeTask extends _BaseTask.default {
  async perform(_ref) {
    let {
      limit
    } = _ref;
    _Logger.default.info("task", `Recalculating attachment sizes for upto ${limit} teams…`);

    // Find unique attachment teamIds created in the last day, update only
    // those teams' approximate attachment sizes
    await _models.Attachment.findAllInBatches({
      attributes: [[_database.sequelize.fn("DISTINCT", _database.sequelize.col("teamId")), "teamId"]],
      where: {
        createdAt: {
          [_sequelize.Op.gt]: (0, _dateFns.subDays)(new Date(), 1)
        }
      },
      batchLimit: 100,
      raw: true
    }, async rows => {
      const teamIds = rows.map(row => row.teamId);
      for (const teamId of teamIds) {
        await _UpdateTeamAttachmentsSizeTask.default.schedule({
          teamId
        });
      }
    });
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = UpdateTeamsAttachmentsSizeTask;
_defineProperty(UpdateTeamsAttachmentsSizeTask, "cron", _BaseTask.TaskSchedule.Daily);