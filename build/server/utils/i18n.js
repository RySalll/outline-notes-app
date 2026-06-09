"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initI18n = initI18n;
exports.opts = opts;
var _path = _interopRequireDefault(require("path"));
var _i18next = _interopRequireDefault(require("i18next"));
var _i18nextFsBackend = _interopRequireDefault(require("i18next-fs-backend"));
var _i18n = require("./../../shared/i18n");
var _date = require("./../../shared/utils/date");
var _env = _interopRequireDefault(require("./../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Returns i18n options for the given user or the default server language if
 * no user is provided.
 *
 * @param user The user to get options for
 * @returns i18n options
 */
function opts(user) {
  return {
    lng: (0, _date.unicodeCLDRtoBCP47)(user?.language ?? _env.default.DEFAULT_LANGUAGE)
  };
}

/**
 * Initializes i18n library, loading all available translations from the
 * filesystem.
 *
 * @returns i18n instance
 */
async function initI18n() {
  const lng = (0, _date.unicodeCLDRtoBCP47)(_env.default.DEFAULT_LANGUAGE);
  _i18next.default.use(_i18nextFsBackend.default);
  await _i18next.default.init({
    compatibilityJSON: "v3",
    backend: {
      loadPath: language => _path.default.resolve(_path.default.join(__dirname, "..", "..", "shared", "i18n", "locales", (0, _date.unicodeBCP47toCLDR)(language), "translation.json"))
    },
    preload: _i18n.languages.map(_date.unicodeCLDRtoBCP47),
    interpolation: {
      escapeValue: false
    },
    lng,
    fallbackLng: lng,
    keySeparator: false,
    returnNull: false
  });
  return _i18next.default;
}