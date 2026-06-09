"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _date = require("../../utils/date");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * An editor extension that adds commands to insert the current date and time.
 */
class DateTime extends _Extension.default {
  get name() {
    return "date_time";
  }
  commands(_options) {
    const {
      template
    } = this.editor.props;
    return {
      date: () => (state, dispatch) => {
        dispatch?.(state.tr.insertText((template ? "{date}" : (0, _date.getCurrentDateAsString)()) + " "));
        return true;
      },
      time: () => (state, dispatch) => {
        dispatch?.(state.tr.insertText((template ? "{time}" : (0, _date.getCurrentTimeAsString)()) + " "));
        return true;
      },
      datetime: () => (state, dispatch) => {
        dispatch?.(state.tr.insertText((template ? "{datetime}" : (0, _date.getCurrentDateTimeAsString)()) + " "));
        return true;
      }
    };
  }
}
exports.default = DateTime;