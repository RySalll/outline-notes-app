"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextHelper = void 0;
var _date = require("./date");
class TextHelper {
  /**
   * Replaces template variables in the given text with the current date and time.
   *
   * @param text The text to replace the variables in
   * @param user The user to get the language/locale from
   * @returns The text with the variables replaced
   */
  static replaceTemplateVariables(text, user) {
    const locales = user.language ? (0, _date.unicodeCLDRtoBCP47)(user.language) : undefined;
    return text.replace(/{date}/g, (0, _date.getCurrentDateAsString)(locales)).replace(/{time}/g, (0, _date.getCurrentTimeAsString)(locales)).replace(/{datetime}/g, (0, _date.getCurrentDateTimeAsString)(locales)).replace(/{author}/g, user.name);
  }
}
exports.TextHelper = TextHelper;