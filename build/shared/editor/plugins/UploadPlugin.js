"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UploadPlugin = void 0;
var _mimeTypes = require("mime-types");
var _prosemirrorState = require("prosemirror-state");
var _files = require("../../utils/files");
var _urls = require("../../utils/urls");
var _insertFiles = _interopRequireDefault(require("../commands/insertFiles"));
var _FileHelper = _interopRequireDefault(require("../lib/FileHelper"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class UploadPlugin extends _prosemirrorState.Plugin {
  constructor(options) {
    super({
      props: {
        handleDOMEvents: {
          paste(view, event) {
            if (!view.editable || !options.uploadFile) {
              return false;
            }
            if (!event.clipboardData) {
              return false;
            }

            // check if we actually pasted any files
            const files = (0, _files.getDataTransferFiles)(event);
            if (files.length === 0) {
              return false;
            }

            // When copying from Microsoft Office product the clipboard contains
            // an image version of the content, check if there is also text and
            // use that instead in this scenario.
            const html = event.clipboardData.getData("text/html");

            // Fallback to default paste behavior if the clipboard contains HTML
            // Even if there is an image, it's likely to be a screenshot from eg
            // Microsoft Suite / Apple Numbers – and not the original content.
            if (html.length && !(0, _files.getDataTransferImage)(event)) {
              return false;
            }
            const {
              tr
            } = view.state;
            if (!tr.selection.empty) {
              tr.deleteSelection();
            }
            const pos = tr.selection.from;
            void (0, _insertFiles.default)(view, event, pos, files, options);
            return true;
          },
          drop(view, event) {
            if (!view.editable || !options.uploadFile) {
              return false;
            }

            // grab the position in the document for the cursor
            const result = view.posAtCoords({
              left: event.clientX,
              top: event.clientY
            });
            if (!result) {
              return false;
            }
            const files = (0, _files.getDataTransferFiles)(event);
            if (files.length) {
              void (0, _insertFiles.default)(view, event, result.pos, files, options);
              return true;
            }
            const imageSrc = (0, _files.getDataTransferImage)(event);
            if (imageSrc && !(0, _urls.isInternalUrl)(imageSrc)) {
              event.stopPropagation();
              event.preventDefault();
              void fetch(imageSrc).then(response => response.blob()).then(blob => {
                const fileName = (0, _urls.fileNameFromUrl)(imageSrc) ?? "pasted-image";
                const ext = (0, _mimeTypes.extension)(blob.type) ?? "png";
                const name = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;
                void (0, _insertFiles.default)(view, event, result.pos, [new File([blob], name, {
                  type: blob.type
                })], options);
              });
            }
            return false;
          }
        },
        transformPasted: (slice, view) => {
          // find any remote images in pasted slice, but leave it alone.
          const images = [];
          slice.content.descendants(node => {
            if (node.type.name === "image" && node.attrs.src && !(0, _urls.isInternalUrl)(node.attrs.src)) {
              images.push(node);
            }
          });

          // Upload each remote image to our storage and replace the src
          // with the new url and dimensions.
          void images.map(async image => {
            const url = await options.uploadFile?.(image.attrs.src);
            if (url) {
              const file = await _FileHelper.default.getFileForUrl(url);
              const dimensions = await _FileHelper.default.getImageDimensions(file);
              const {
                tr
              } = view.state;
              tr.doc.nodesBetween(0, tr.doc.nodeSize - 2, (node, pos) => {
                if (node.type.name === "image" && node.attrs.src === image.attrs.src) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    ...dimensions,
                    src: url
                  });
                }
              });
              view.dispatch(tr);
            }
          });
          return slice;
        }
      }
    });
  }
}
exports.UploadPlugin = UploadPlugin;