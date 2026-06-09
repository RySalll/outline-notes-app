"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRecentCodeLanguage = exports.getRecentCodeLanguage = exports.getFrequentCodeLanguages = exports.FrequentlyUsedCount = void 0;
var _Storage = _interopRequireDefault(require("../../utils/Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const RecentStorageKey = "rme-code-language";
const StorageKey = "frequent-code-languages";
const FrequentlyUsedCount = exports.FrequentlyUsedCount = {
  Get: 5,
  Track: 10
};
const setRecentCodeLanguage = language => {
  const frequentLangs = _Storage.default.get(StorageKey) ?? {};
  if (Object.keys(frequentLangs).length === 0) {
    const lastUsedLang = _Storage.default.get(RecentStorageKey);
    if (lastUsedLang) {
      frequentLangs[lastUsedLang] = 1;
    }
  }
  frequentLangs[language] = (frequentLangs[language] ?? 0) + 1;
  const frequentLangEntries = Object.entries(frequentLangs);
  if (frequentLangEntries.length > FrequentlyUsedCount.Track) {
    sortFrequencies(frequentLangEntries);
    const lastEntry = frequentLangEntries[FrequentlyUsedCount.Track];
    if (lastEntry[0] === language) {
      frequentLangEntries.splice(FrequentlyUsedCount.Track - 1, 1);
    } else {
      frequentLangEntries.splice(FrequentlyUsedCount.Track);
    }
  }
  _Storage.default.set(StorageKey, Object.fromEntries(frequentLangEntries));
  _Storage.default.set(RecentStorageKey, language);
};
exports.setRecentCodeLanguage = setRecentCodeLanguage;
const getRecentCodeLanguage = () => _Storage.default.get(RecentStorageKey);
exports.getRecentCodeLanguage = getRecentCodeLanguage;
const getFrequentCodeLanguages = () => {
  const recentLang = _Storage.default.get(RecentStorageKey);
  const frequentLangEntries = Object.entries(_Storage.default.get(StorageKey) ?? {});
  const frequentLangs = sortFrequencies(frequentLangEntries).slice(0, FrequentlyUsedCount.Get).map(_ref => {
    let [lang] = _ref;
    return lang;
  });
  const isRecentLangPresent = frequentLangs.includes(recentLang);
  if (recentLang && !isRecentLangPresent) {
    frequentLangs.pop();
    frequentLangs.push(recentLang);
  }
  return frequentLangs;
};
exports.getFrequentCodeLanguages = getFrequentCodeLanguages;
const sortFrequencies = freqs => freqs.sort((a, b) => a[1] >= b[1] ? -1 : 1);