"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Mailer = void 0;
var _nodemailer = _interopRequireDefault(require("nodemailer"));
var _oyVey = _interopRequireDefault(require("oy-vey"));
var _env = _interopRequireDefault(require("./../env"));
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _tracing = require("./../logging/tracing");
var _EmailLayout = require("./templates/components/EmailLayout");
var _dec, _dec2, _dec3, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const useTestEmailService = _env.default.isDevelopment && !_env.default.SMTP_USERNAME;
/**
 * Mailer class to send emails.
 */
let Mailer = exports.Mailer = (_dec = (0, _tracing.trace)({
  serviceName: "mailer"
}), _dec2 = Reflect.metadata("design:type", Function), _dec3 = Reflect.metadata("design:paramtypes", []), _dec(_class = _dec2(_class = _dec3(_class = class Mailer {
  constructor() {
    _defineProperty(this, "transporter", void 0);
    _defineProperty(this, "template", _ref => {
      let {
        title,
        bodyContent,
        headCSS = "",
        bgColor = "#FFFFFF",
        lang,
        dir = "ltr" /* https://www.w3.org/TR/html4/struct/dirlang.html#blocklevel-bidi */
      } = _ref;
      if (!title) {
        throw new Error("`title` is a required option for `renderTemplate`");
      } else if (!bodyContent) {
        throw new Error("`bodyContent` is a required option for `renderTemplate`");
      }

      // the template below is a slightly modified form of https://github.com/revivek/oy/blob/master/src/utils/HTML4.js
      return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html
      ${lang ? 'lang="' + lang + '"' : ""}
      dir="${dir}"
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width"/>

        <title>${title}</title>

        <style type="text/css">
          ${headCSS}

          #__bodyTable__ {
            margin: 0;
            padding: 0;
            width: 100% !important;
          }
        </style>

        <!--[if gte mso 9]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        <![endif]-->
      </head>
      <body bgcolor="${bgColor}" width="100%" style="-webkit-font-smoothing: antialiased; width:100% !important; background:${bgColor};-webkit-text-size-adjust:none; margin:0; padding:0; min-width:100%; direction: ${dir};">
        ${bodyContent}
      </body>
    </html>
  `;
    });
    /**
     *
     * @param data Email headers and body
     * @returns Message ID header from SMTP server
     */
    _defineProperty(this, "sendMail", async data => {
      const {
        transporter
      } = this;
      if (!transporter) {
        _Logger.default.info("email", [`Attempted to send email but no transport configured.`, ``, `--------------`, `From:      ${data.from.address}`, `To:        ${data.to}`, `Subject:   ${data.subject}`, `Preview:   ${data.previewText}`, `--------------`, ``, data.text].join("\n"));
        return;
      }
      const html = _oyVey.default.renderTemplate(data.component, {
        title: data.subject,
        headCSS: [_EmailLayout.baseStyles, data.headCSS].join(" ")
      }, this.template);
      try {
        _Logger.default.info("email", `Sending email "${data.subject}" to ${data.to}`);
        const info = await transporter.sendMail({
          from: data.from,
          replyTo: data.replyTo ?? _env.default.SMTP_REPLY_EMAIL ?? _env.default.SMTP_FROM_EMAIL,
          to: data.to,
          messageId: data.messageId,
          references: data.references,
          inReplyTo: data.references?.at(-1),
          subject: data.subject,
          html,
          text: data.text,
          list: data.unsubscribeUrl ? {
            unsubscribe: {
              url: data.unsubscribeUrl,
              comment: "Unsubscribe from these emails"
            }
          } : undefined,
          attachments: _env.default.isCloudHosted ? undefined : [{
            filename: "header-logo.png",
            path: process.cwd() + "/public/email/header-logo.png",
            cid: "header-image"
          }]
        });
        if (useTestEmailService) {
          _Logger.default.info("email", `Preview Url: ${_nodemailer.default.getTestMessageUrl(info)}`);
        }
      } catch (err) {
        _Logger.default.error(`Error sending email to ${data.to}`, err);
        throw err; // Re-throw for queue to re-try
      }
    });
    if (_env.default.SMTP_HOST) {
      this.transporter = _nodemailer.default.createTransport(this.getOptions());
    }
    if (useTestEmailService) {
      _Logger.default.info("email", "SMTP_USERNAME not provided, generating test account…");
      void this.getTestTransportOptions().then(options => {
        if (!options) {
          _Logger.default.info("email", "Couldn't generate a test account with ethereal.email at this time – emails will not be sent.");
          return;
        }
        this.transporter = _nodemailer.default.createTransport(options);
      });
    }
  }
  getOptions() {
    return {
      name: _env.default.SMTP_NAME,
      host: _env.default.SMTP_HOST,
      port: _env.default.SMTP_PORT,
      secure: _env.default.SMTP_SECURE ?? _env.default.isProduction,
      auth: _env.default.SMTP_USERNAME ? {
        user: _env.default.SMTP_USERNAME,
        pass: _env.default.SMTP_PASSWORD
      } : undefined,
      tls: _env.default.SMTP_SECURE ? _env.default.SMTP_TLS_CIPHERS ? {
        ciphers: _env.default.SMTP_TLS_CIPHERS
      } : undefined : {
        rejectUnauthorized: false
      }
    };
  }
  async getTestTransportOptions() {
    try {
      const testAccount = await _nodemailer.default.createTestAccount();
      return {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      };
    } catch (err) {
      return undefined;
    }
  }
}) || _class) || _class) || _class);
var _default = exports.default = new Mailer();