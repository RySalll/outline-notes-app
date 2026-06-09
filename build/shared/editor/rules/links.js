"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = linksToNodes;
var _env = _interopRequireDefault(require("../../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function isParagraph(token) {
  return token.type === "paragraph_open";
}
function isInline(token) {
  return token.type === "inline";
}
function isLinkOpen(token) {
  return token.type === "link_open";
}
function isLinkClose(token) {
  return token.type === "link_close";
}
function isAttachment(token) {
  const href = token.attrGet("href");
  if (href?.includes("display=link")) {
    return false;
  }
  return (
    // internal
    // external (public share are pre-signed and this is a reasonable way of detecting them)
    href?.startsWith("/api/attachments.redirect") || href?.startsWith("/api/files.get") || href?.startsWith(`${_env.default.URL}/api/files.get`) || (href?.startsWith(_env.default.AWS_S3_UPLOAD_BUCKET_URL) || href?.startsWith(_env.default.AWS_S3_ACCELERATE_URL)) && href?.includes("X-Amz-Signature")
  );
}
function linksToNodes(md) {
  md.core.ruler.after("breaks", "attachments", state => {
    const tokens = state.tokens;
    let insideLink;
    for (let i = 0; i < tokens.length - 1; i++) {
      // once we find an inline token look through it's children for links
      if (isInline(tokens[i]) && isParagraph(tokens[i - 1])) {
        const tokenChildren = tokens[i].children || [];
        for (let j = 0; j < tokenChildren.length - 1; j++) {
          const current = tokenChildren[j];
          if (!current) {
            continue;
          }
          if (isLinkOpen(current)) {
            insideLink = current;
            continue;
          }
          if (isLinkClose(current)) {
            insideLink = null;
            continue;
          }

          // of hey, we found a link – lets check to see if it should be
          // converted to a file attachment
          if (insideLink && isAttachment(insideLink)) {
            const {
              content
            } = current;
            const parts = content.split(" ");
            const size = parts.pop();
            const title = parts.join(" ");
            if (size?.includes("x")) {
              // convert to video
              const token = new state.Token("video", "video", 0);
              token.attrSet("src", insideLink.attrGet("href") || "");
              token.attrSet("width", size.split("x")[0] || "0");
              token.attrSet("height", size.split("x")[1] || "0");
              token.attrSet("title", title);
              tokens.splice(i - 1, 3, token);
            } else {
              // convert to attachment token
              const token = new state.Token("attachment", "a", 0);
              token.attrSet("href", insideLink.attrGet("href") || "");
              token.attrSet("size", size || "0");
              token.attrSet("title", title);
              tokens.splice(i - 1, 3, token);
            }

            // delete the inline link – this makes the assumption that the
            // attachment is the only thing in the para.
            insideLink = null;
            break;
          }
        }
      }
    }
    return false;
  });
}