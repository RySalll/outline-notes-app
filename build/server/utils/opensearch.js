"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.opensearchResponse = void 0;
var _env = _interopRequireDefault(require("./../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const opensearchResponse = baseUrl => `
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>${_env.default.APP_NAME}</ShortName>
  <Description>Search ${_env.default.APP_NAME}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${baseUrl}/images/favicon-16.png</Image>
  <Url type="text/html" method="get" template="${baseUrl}/search/{searchTerms}?ref=opensearch"/>
  <moz:SearchForm>${baseUrl}/search</moz:SearchForm>
</OpenSearchDescription>
`;
exports.opensearchResponse = opensearchResponse;