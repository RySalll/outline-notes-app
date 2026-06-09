"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = filterExcessSeparators;
function filterExcessSeparators(items) {
  return items.reduce((acc, item) => {
    // trim separator if the previous item was a separator
    if (item.name === "separator" && acc[acc.length - 1]?.name === "separator") {
      return acc;
    }
    return [...acc, item];
  }, []).filter((item, index, arr) => {
    if (item.name === "separator" && (index === 0 || index === arr.length - 1)) {
      return false;
    }
    return true;
  });
}