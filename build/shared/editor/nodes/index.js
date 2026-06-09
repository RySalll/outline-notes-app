"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withComments = exports.tableExtensions = exports.richExtensions = exports.listExtensions = exports.basicExtensions = void 0;
var _DateTime = _interopRequireDefault(require("../extensions/DateTime"));
var _History = _interopRequireDefault(require("../extensions/History"));
var _MaxLength = _interopRequireDefault(require("../extensions/MaxLength"));
var _Placeholder = _interopRequireDefault(require("../extensions/Placeholder"));
var _TrailingNode = _interopRequireDefault(require("../extensions/TrailingNode"));
var _Bold = _interopRequireDefault(require("../marks/Bold"));
var _Code = _interopRequireDefault(require("../marks/Code"));
var _Comment = _interopRequireDefault(require("../marks/Comment"));
var _Highlight = _interopRequireDefault(require("../marks/Highlight"));
var _Italic = _interopRequireDefault(require("../marks/Italic"));
var _Link = _interopRequireDefault(require("../marks/Link"));
var _Placeholder2 = _interopRequireDefault(require("../marks/Placeholder"));
var _Strikethrough = _interopRequireDefault(require("../marks/Strikethrough"));
var _Underline = _interopRequireDefault(require("../marks/Underline"));
var _Attachment = _interopRequireDefault(require("./Attachment"));
var _Blockquote = _interopRequireDefault(require("./Blockquote"));
var _BulletList = _interopRequireDefault(require("./BulletList"));
var _CheckboxItem = _interopRequireDefault(require("./CheckboxItem"));
var _CheckboxList = _interopRequireDefault(require("./CheckboxList"));
var _CodeBlock = _interopRequireDefault(require("./CodeBlock"));
var _CodeFence = _interopRequireDefault(require("./CodeFence"));
var _Doc = _interopRequireDefault(require("./Doc"));
var _Embed = _interopRequireDefault(require("./Embed"));
var _Emoji = _interopRequireDefault(require("./Emoji"));
var _HardBreak = _interopRequireDefault(require("./HardBreak"));
var _Heading = _interopRequireDefault(require("./Heading"));
var _HorizontalRule = _interopRequireDefault(require("./HorizontalRule"));
var _Image = _interopRequireDefault(require("./Image"));
var _ListItem = _interopRequireDefault(require("./ListItem"));
var _Math = _interopRequireDefault(require("./Math"));
var _MathBlock = _interopRequireDefault(require("./MathBlock"));
var _Mention = _interopRequireDefault(require("./Mention"));
var _Notice = _interopRequireDefault(require("./Notice"));
var _OrderedList = _interopRequireDefault(require("./OrderedList"));
var _Paragraph = _interopRequireDefault(require("./Paragraph"));
var _SimpleImage = _interopRequireDefault(require("./SimpleImage"));
var _Table = _interopRequireDefault(require("./Table"));
var _TableCell = _interopRequireDefault(require("./TableCell"));
var _TableHeader = _interopRequireDefault(require("./TableHeader"));
var _TableRow = _interopRequireDefault(require("./TableRow"));
var _Text = _interopRequireDefault(require("./Text"));
var _Video = _interopRequireDefault(require("./Video"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * The basic set of nodes that are used in the editor. This is used for simple
 * editors that need basic formatting.
 */
const basicExtensions = exports.basicExtensions = [_Doc.default, _Paragraph.default, _Emoji.default, _Text.default, _SimpleImage.default, _Bold.default, _Code.default, _Italic.default, _Underline.default, _Link.default, _Strikethrough.default, _History.default, _TrailingNode.default, _Placeholder.default, _MaxLength.default, _DateTime.default];
const listExtensions = exports.listExtensions = [_CheckboxList.default, _CheckboxItem.default, _BulletList.default, _OrderedList.default, _ListItem.default];
const tableExtensions = exports.tableExtensions = [_TableCell.default, _TableHeader.default, _TableRow.default,
// Note: Table nodes comes last to ensure the table selection plugin is registered after the
// plugins for table grips in TableCell and TableHeader.
_Table.default];

/**
 * The full set of nodes that are used in the editor. This is used for rich
 * editors that need advanced formatting.
 */
const richExtensions = exports.richExtensions = [...basicExtensions.filter(n => n !== _SimpleImage.default), _Image.default, _HardBreak.default, _CodeBlock.default, _CodeFence.default, _Blockquote.default, _Embed.default, _Attachment.default, _Video.default, _Notice.default, _Heading.default, _HorizontalRule.default, _Highlight.default, _Placeholder2.default, _Math.default, _MathBlock.default, _Mention.default,
// Container type nodes should be last so that key handlers are registered for content inside
// the container nodes first.
...listExtensions, ...tableExtensions];

/**
 * Add commenting and mentions to a set of nodes
 */
const withComments = nodes => [...nodes.filter(node => node !== _Mention.default), _Mention.default, _Comment.default];
exports.withComments = withComments;