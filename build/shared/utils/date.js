"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dateLocale = dateLocale;
exports.dateToRelative = dateToRelative;
exports.getCurrentDateAsString = getCurrentDateAsString;
exports.getCurrentDateTimeAsString = getCurrentDateTimeAsString;
exports.getCurrentTimeAsString = getCurrentTimeAsString;
exports.locales = void 0;
exports.subtractDate = subtractDate;
exports.unicodeBCP47toCLDR = unicodeBCP47toCLDR;
exports.unicodeCLDRtoBCP47 = unicodeCLDRtoBCP47;
exports.unicodeCLDRtoISO639 = unicodeCLDRtoISO639;
var _dateFns = require("date-fns");
var _locale = require("date-fns/locale");
/* eslint-disable import/no-duplicates */

function subtractDate(date, period) {
  switch (period) {
    case "day":
      return (0, _dateFns.subDays)(date, 1);
    case "week":
      return (0, _dateFns.subWeeks)(date, 1);
    case "month":
      return (0, _dateFns.subMonths)(date, 1);
    case "year":
      return (0, _dateFns.subYears)(date, 1);
    default:
      return date;
  }
}

/**
 * Returns a humanized relative time string for the given date.
 *
 * @param date The date to convert
 * @param options The options to pass to date-fns
 * @returns The relative time string
 */
function dateToRelative(date, options) {
  const now = new Date();
  const parsedDateTime = new Date(date);

  // Protect against "in less than a minute" when users computer clock is off.
  const normalizedDateTime = parsedDateTime > now && parsedDateTime < (0, _dateFns.addSeconds)(now, 60) ? now : parsedDateTime;
  const output = (0, _dateFns.formatDistanceToNow)(normalizedDateTime, options);

  // Some tweaks to make english language shorter.
  if (options?.shorten) {
    return output.replace("about", "").replace("less than a minute ago", "just now").replace("minute", "min");
  }
  return output;
}

/**
 * Converts a locale string from Unicode CLDR format to BCP47 format.
 *
 * @param locale The locale string to convert
 * @returns The converted locale string
 */
function unicodeCLDRtoBCP47(locale) {
  return locale.replace("_", "-").replace("root", "und");
}

/**
 * Converts a locale string from BCP47 format to Unicode CLDR format.
 *
 * @param locale The locale string to convert
 * @returns The converted locale string
 */
function unicodeBCP47toCLDR(locale) {
  return locale.replace("-", "_").replace("und", "root");
}

/**
 * Converts a locale string from Unicode CLDR format to ISO 639 format.
 *
 * @param locale The locale string to convert
 * @returns The converted locale string
 */
function unicodeCLDRtoISO639(locale) {
  return locale.split("_")[0];
}

/**
 * Returns the current date as a string formatted depending on current locale.
 *
 * @returns The current date
 */
function getCurrentDateAsString(locale) {
  return new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/**
 * Returns the current time as a string formatted depending on current locale.
 *
 * @returns The current time
 */
function getCurrentTimeAsString(locale) {
  return new Date().toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "numeric"
  });
}

/**
 * Returns the current date and time as a string formatted depending on current
 * locale.
 *
 * @returns The current date and time
 */
function getCurrentDateTimeAsString(locale) {
  return new Date().toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  });
}
const locales = exports.locales = {
  cs_CZ: _locale.cs,
  de_DE: _locale.de,
  en_US: _locale.enUS,
  es_ES: _locale.es,
  fa_IR: _locale.faIR,
  fr_FR: _locale.fr,
  it_IT: _locale.it,
  ja_JP: _locale.ja,
  ko_KR: _locale.ko,
  nb_NO: _locale.nb,
  nl_NL: _locale.nl,
  pt_BR: _locale.ptBR,
  pt_PT: _locale.pt,
  pl_PL: _locale.pl,
  sv_SE: _locale.sv,
  tr_TR: _locale.tr,
  uk_UA: _locale.uk,
  vi_VN: _locale.vi,
  zh_CN: _locale.zhCN,
  zh_TW: _locale.zhTW
};

/**
 * Returns the date-fns locale object for the given user language preference.
 *
 * @param language The user language
 * @returns The date-fns locale.
 */
function dateLocale(language) {
  return language ? locales[language] : undefined;
}