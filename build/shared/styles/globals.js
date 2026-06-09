"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _styledComponents = require("styled-components");
var _styledNormalize = _interopRequireDefault(require("styled-normalize"));
var _ = require(".");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports.default = (0, _styledComponents.createGlobalStyle)`
  ${_styledNormalize.default}

  * {
    box-sizing: border-box;
  }

  html,
  body {
    width: 100%;
    ${props => props.staticHTML ? "" : "height: 100%;"}
    margin: 0;
    padding: 0;
    print-color-adjust: exact;
    --pointer: ${props => props.useCursorPointer ? "pointer" : "default"};
    overscroll-behavior-x: none;

    @media print {
      background: none !important;
    }
  }

  body,
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: ${(0, _.s)("fontFamily")};
  }

  body {
    font-size: 16px;
    line-height: 1.5;
    color: ${(0, _.s)("text")};
    overscroll-behavior-y: none;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  @media (min-width: ${_.breakpoints.tablet}px) {
    html,
    body {
      min-height: ${props => props.staticHTML ? "0" : "100vh"};
    }
  }

  @media (min-width: ${_.breakpoints.tablet}px) and (display-mode: standalone) {
    body:after {
      content: "";
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: ${props => props.theme.titleBarDivider};
      z-index: ${_.depths.titleBarDivider};
    }
  }

  a {
    color: ${props => props.theme.link};
    text-decoration: none;
    cursor: pointer;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 500;
    line-height: 1.25;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  h1 { font-size: 36px; }
  h2 { font-size: 26px; }
  h3 { font-size: 20px; }
  h4 { font-size: 18px; }
  h5 { font-size: 16px; }

  p,
  dl,
  ol,
  ul,
  pre,
  blockquote {
    margin-top: 1em;
    margin-bottom: 1em;
  }

  hr {
    border: 0;
    height: 0;
    border-top: 1px solid ${(0, _.s)("divider")};
  }

  :focus-visible {
    outline-color: ${(0, _.s)("accent")};
    outline-offset: -1px;
    outline-width: initial;
  }
`;