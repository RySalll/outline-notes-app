"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.light = exports.default = exports.buildPitchBlackTheme = exports.buildLightTheme = exports.buildDarkTheme = void 0;
var _polished = require("polished");
var _breakpoints = _interopRequireDefault(require("./breakpoints"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const defaultColors = {
  transparent: "transparent",
  almostBlack: "#111319",
  lightBlack: "#2F3336",
  almostWhite: "#E6E6E6",
  veryDarkBlue: "#08090C",
  slate: "#66778F",
  slateLight: "#DAE1E9",
  slateDark: "#394351",
  smoke: "#F4F7FA",
  smokeLight: "#F9FBFC",
  smokeDark: "#E8EBED",
  white: "#FFFFFF",
  white05: "rgba(255, 255, 255, 0.05)",
  white10: "rgba(255, 255, 255, 0.1)",
  white50: "rgba(255, 255, 255, 0.5)",
  white75: "rgba(255, 255, 255, 0.75)",
  black: "#000",
  black05: "rgba(0, 0, 0, 0.05)",
  black10: "rgba(0, 0, 0, 0.1)",
  black50: "rgba(0, 0, 0, 0.50)",
  black75: "rgba(0, 0, 0, 0.75)",
  accent: "#0366d6",
  yellow: "#EDBA07",
  warmGrey: "#EDF2F7",
  danger: "#ed2651",
  warning: "#f08a24",
  success: "#2f3336",
  info: "#a0d3e8",
  brand: {
    red: "#FF5C80",
    pink: "#FF4DFA",
    purple: "#9E5CF7",
    blue: "#3633FF",
    marine: "#2BC2FF",
    dusk: "#2930FF",
    green: "#3ad984",
    yellow: "#F5BE31"
  }
};
const spacing = {
  sidebarWidth: 260,
  sidebarRightWidth: 300,
  sidebarCollapsedWidth: 16,
  sidebarMinWidth: 200,
  sidebarMaxWidth: 600
};
const buildBaseTheme = input => {
  const colors = {
    ...defaultColors,
    ...input
  };
  return {
    fontFamily: "-apple-system, BlinkMacSystemFont, Inter, 'Segoe UI', Roboto, Oxygen, sans-serif",
    fontFamilyMono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
    fontFamilyEmoji: "Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Segoe UI, Twemoji Mozilla, Noto Color Emoji, Android Emoji",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    accentText: colors.white,
    selected: colors.accent,
    textHighlight: "#FDEA9B",
    textHighlightForeground: colors.almostBlack,
    commentMarkBackground: (0, _polished.transparentize)(0.5, "#2BC2FF"),
    code: colors.lightBlack,
    codeComment: "#6a737d",
    codePunctuation: "#5e6687",
    codeNumber: "#d73a49",
    codeProperty: "#c08b30",
    codeTag: "#3d8fd1",
    codeClassName: "#3d8fd1",
    codeString: "#032f62",
    codeSelector: "#6679cc",
    codeAttr: "#c76b29",
    codeEntity: "#22a2c9",
    codeKeyword: "#d73a49",
    codeFunction: "#6f42c1",
    codeStatement: "#22a2c9",
    codePlaceholder: "#3d8fd1",
    codeInserted: "#202746",
    codeImportant: "#c94922",
    noticeInfoBackground: colors.brand.blue,
    noticeInfoText: colors.almostBlack,
    noticeTipBackground: "#F5BE31",
    noticeTipText: colors.almostBlack,
    noticeWarningBackground: "#d73a49",
    noticeWarningText: colors.almostBlack,
    noticeSuccessBackground: colors.brand.green,
    noticeSuccessText: colors.almostBlack,
    tableSelectedBackground: (0, _polished.transparentize)(0.9, colors.accent),
    breakpoints: _breakpoints.default,
    ...colors,
    ...spacing
  };
};
const buildLightTheme = input => {
  const colors = buildBaseTheme(input);
  return {
    ...colors,
    isDark: false,
    background: colors.white,
    backgroundSecondary: colors.warmGrey,
    backgroundTertiary: "#d7e0ea",
    backgroundQuaternary: (0, _polished.darken)(0.05, "#d7e0ea"),
    link: colors.accent,
    cursor: colors.almostBlack,
    text: colors.almostBlack,
    textSecondary: colors.slateDark,
    textTertiary: colors.slate,
    textDiffInserted: colors.almostBlack,
    textDiffInsertedBackground: "rgba(18, 138, 41, 0.16)",
    textDiffDeleted: colors.slateDark,
    textDiffDeletedBackground: "#ffebe9",
    placeholder: "#a2b2c3",
    sidebarBackground: colors.warmGrey,
    sidebarActiveBackground: "#d7e0ea",
    sidebarControlHoverBackground: "rgb(138 164 193 / 20%)",
    sidebarDraftBorder: (0, _polished.darken)("0.25", colors.warmGrey),
    sidebarText: "rgb(78, 92, 110)",
    backdrop: "rgba(0, 0, 0, 0.2)",
    shadow: "rgba(0, 0, 0, 0.2)",
    modalBackdrop: "rgba(0, 0, 0, 0.15)",
    modalBackground: colors.white,
    modalShadow: "0 4px 8px rgb(0 0 0 / 8%), 0 2px 4px rgb(0 0 0 / 0%), 0 30px 40px rgb(0 0 0 / 8%)",
    menuItemSelected: colors.warmGrey,
    menuBackground: colors.white,
    menuShadow: "0 0 0 1px rgb(0 0 0 / 2%), 0 4px 8px rgb(0 0 0 / 8%), 0 2px 4px rgb(0 0 0 / 0%), 0 30px 40px rgb(0 0 0 / 8%)",
    divider: colors.slateLight,
    titleBarDivider: colors.slateLight,
    inputBorder: colors.slateLight,
    inputBorderFocused: colors.slate,
    listItemHoverBackground: colors.warmGrey,
    mentionBackground: colors.warmGrey,
    mentionHoverBackground: "#d7e0ea",
    tableSelected: colors.accent,
    buttonNeutralBackground: colors.white,
    buttonNeutralText: colors.almostBlack,
    buttonNeutralBorder: (0, _polished.darken)(0.15, colors.white),
    tooltipBackground: colors.almostBlack,
    tooltipText: colors.white,
    toastBackground: colors.white,
    toastText: colors.almostBlack,
    quote: colors.slateLight,
    codeBackground: colors.smoke,
    codeBorder: colors.smokeDark,
    embedBorder: colors.slateLight,
    horizontalRule: colors.smokeDark,
    progressBarBackground: colors.slateLight,
    scrollbarBackground: colors.smoke,
    scrollbarThumb: (0, _polished.darken)(0.15, colors.smokeDark)
  };
};
exports.buildLightTheme = buildLightTheme;
const buildDarkTheme = input => {
  const colors = buildBaseTheme(input);
  return {
    ...colors,
    isDark: true,
    background: colors.almostBlack,
    backgroundSecondary: "#1f232e",
    backgroundTertiary: "#2a2f3e",
    backgroundQuaternary: (0, _polished.lighten)(0.1, "#2a2f3e"),
    link: "#137FFB",
    text: colors.almostWhite,
    cursor: colors.almostWhite,
    textSecondary: (0, _polished.lighten)(0.1, colors.slate),
    textTertiary: colors.slate,
    textDiffInserted: colors.almostWhite,
    textDiffInsertedBackground: "rgba(63,185,80,0.3)",
    textDiffDeleted: (0, _polished.darken)(0.1, colors.almostWhite),
    textDiffDeletedBackground: "rgba(248,81,73,0.15)",
    placeholder: "#596673",
    sidebarBackground: colors.veryDarkBlue,
    sidebarActiveBackground: (0, _polished.lighten)(0.09, colors.veryDarkBlue),
    sidebarControlHoverBackground: colors.white10,
    sidebarDraftBorder: (0, _polished.darken)("0.35", colors.slate),
    sidebarText: colors.slate,
    backdrop: "rgba(0, 0, 0, 0.5)",
    shadow: "rgba(0, 0, 0, 0.6)",
    modalBackdrop: colors.black50,
    modalBackground: "#181c25",
    modalShadow: "0 0 0 1px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.08)",
    menuItemSelected: (0, _polished.lighten)(0.09, "#181c25"),
    menuBackground: "#181c25",
    menuShadow: "0 0 0 1px rgb(34 40 52), 0 8px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.08)",
    divider: (0, _polished.lighten)(0.1, colors.almostBlack),
    titleBarDivider: (0, _polished.darken)(0.4, colors.slate),
    inputBorder: colors.slateDark,
    inputBorderFocused: colors.slate,
    listItemHoverBackground: colors.white10,
    mentionBackground: (0, _polished.lighten)(0.09, colors.veryDarkBlue),
    mentionHoverBackground: (0, _polished.lighten)(0.15, colors.veryDarkBlue),
    tableSelected: colors.accent,
    buttonNeutralBackground: colors.almostBlack,
    buttonNeutralText: colors.white,
    buttonNeutralBorder: colors.slateDark,
    tooltipBackground: colors.white,
    tooltipText: colors.lightBlack,
    toastBackground: colors.veryDarkBlue,
    toastText: colors.almostWhite,
    quote: colors.almostWhite,
    code: colors.almostWhite,
    codeBackground: "#1d202a",
    codeBorder: colors.white10,
    codeTag: "#b5cea8",
    codeString: "#ce9178",
    codeKeyword: "#569CD6",
    codeFunction: "#dcdcaa",
    codeClassName: "#4ec9b0",
    codeImportant: "#569CD6",
    codeAttr: "#9cdcfe",
    embedBorder: colors.black50,
    horizontalRule: (0, _polished.lighten)(0.1, colors.almostBlack),
    noticeInfoText: colors.white,
    noticeTipText: colors.white,
    noticeWarningText: colors.white,
    noticeSuccessText: colors.white,
    progressBarBackground: colors.slate,
    scrollbarBackground: colors.black,
    scrollbarThumb: colors.lightBlack
  };
};
exports.buildDarkTheme = buildDarkTheme;
const buildPitchBlackTheme = input => {
  const colors = buildDarkTheme(input);
  return {
    ...colors,
    background: colors.black,
    codeBackground: colors.almostBlack
  };
};
exports.buildPitchBlackTheme = buildPitchBlackTheme;
const light = exports.light = buildLightTheme(defaultColors);
var _default = exports.default = light;