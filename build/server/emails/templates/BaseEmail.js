"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EmailMessageCategory = void 0;
var _addressparser = _interopRequireDefault(require("addressparser"));
var _invariant = _interopRequireDefault(require("invariant"));
var _randomstring = _interopRequireDefault(require("randomstring"));
var React = _interopRequireWildcard(require("react"));
var _types = require("./../../../shared/types");
var _time = require("./../../../shared/utils/time");
var _mailer = _interopRequireDefault(require("./../mailer"));
var _env = _interopRequireDefault(require("./../../env"));
var _Logger = _interopRequireDefault(require("./../../logging/Logger"));
var _Metrics = _interopRequireDefault(require("./../../logging/Metrics"));
var _Notification = _interopRequireDefault(require("./../../models/Notification"));
var _HTMLHelper = _interopRequireDefault(require("./../../models/helpers/HTMLHelper"));
var _ProsemirrorHelper = require("./../../models/helpers/ProsemirrorHelper");
var _TextHelper = require("./../../models/helpers/TextHelper");
var _queues = require("./../../queues");
var _BaseTask = require("./../../queues/tasks/BaseTask");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let EmailMessageCategory = exports.EmailMessageCategory = /*#__PURE__*/function (EmailMessageCategory) {
  EmailMessageCategory["Authentication"] = "authentication";
  EmailMessageCategory["Invitation"] = "invitation";
  EmailMessageCategory["Notification"] = "notification";
  EmailMessageCategory["Marketing"] = "marketing";
  return EmailMessageCategory;
}({});
class BaseEmail {
  /** The message category for the email. */

  /**
   * Schedule this email type to be sent asyncronously by a worker.
   *
   * @param options Options to pass to the Bull queue
   * @returns A promise that resolves once the email is placed on the task queue
   */
  schedule(options) {
    // No-op to schedule emails if SMTP is not configured
    if (!_env.default.SMTP_FROM_EMAIL) {
      _Logger.default.info("email", `Email ${this.constructor.name} not sent due to missing SMTP_FROM_EMAIL configuration`);
      return;
    }
    const templateName = this.constructor.name;
    _Metrics.default.increment("email.scheduled", {
      templateName
    });

    // Ideally we'd use EmailTask.schedule here but importing creates a circular
    // dependency so we're pushing onto the task queue in the expected format
    return _queues.taskQueue.add({
      name: "EmailTask",
      props: {
        templateName,
        ...this.metadata,
        props: this.props
      }
    }, {
      priority: _BaseTask.TaskPriority.Normal,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 60 * 1000
      },
      ...options
    });
  }
  constructor(props, metadata) {
    _defineProperty(this, "props", void 0);
    _defineProperty(this, "metadata", void 0);
    this.props = props;
    this.metadata = metadata;
  }

  /**
   * Send this email now.
   *
   * @returns A promise that resolves once the email has been successfully sent.
   */
  async send() {
    const templateName = this.constructor.name;
    const bsResponse = await this.beforeSend?.(this.props);
    if (bsResponse === false) {
      _Logger.default.info("email", `Email ${templateName} not sent due to beforeSend hook`, this.props);
      return;
    }
    if (!this.props.to) {
      _Logger.default.info("email", `Email ${templateName} not sent due to missing email address`, this.props);
      return;
    }
    const notification = this.metadata?.notificationId ? await _Notification.default.scope(["withActor", "withUser"]).findByPk(this.metadata?.notificationId) : undefined;
    const data = {
      ...this.props,
      notification,
      ...(bsResponse ?? {})
    };
    if (notification?.viewedAt) {
      _Logger.default.info("email", `Email ${templateName} not sent as already viewed`, this.props);
      return;
    }
    const messageId = notification ? _Notification.default.emailMessageId(notification.id) : undefined;
    const references = notification ? await _Notification.default.emailReferences(notification) : undefined;
    try {
      await _mailer.default.sendMail({
        to: this.props.to,
        replyTo: this.replyTo?.(data),
        from: this.from(data),
        subject: this.subject(data),
        messageId,
        references,
        previewText: this.preview(data),
        component: /*#__PURE__*/React.createElement(React.Fragment, null, this.render(data), notification ? this.pixel(notification) : null),
        text: this.renderAsText(data),
        headCSS: this.headCSS?.(data),
        unsubscribeUrl: this.unsubscribeUrl?.(data)
      });
      _Metrics.default.increment("email.sent", {
        templateName
      });
    } catch (err) {
      _Metrics.default.increment("email.sending_failed", {
        templateName
      });
      throw err;
    }
    if (notification) {
      try {
        notification.emailedAt = new Date();
        await notification.save();
      } catch (err) {
        _Logger.default.error(`Failed to update notification`, err, this.metadata);
      }
    }
  }
  from(props) {
    (0, _invariant.default)(_env.default.SMTP_FROM_EMAIL, "SMTP_FROM_EMAIL is required to send emails");
    const parsedFrom = (0, _addressparser.default)(_env.default.SMTP_FROM_EMAIL)[0];
    const domain = parsedFrom.address.split("@")[1];
    const customFromName = this.fromName?.(props);
    return {
      name: customFromName ? `${customFromName} via ${_env.default.APP_NAME}` : parsedFrom.name,
      address: _env.default.isCloudHosted && this.category === EmailMessageCategory.Authentication ? `noreply-${_randomstring.default.generate(24)}@${domain}` : parsedFrom.address
    };
  }
  pixel(notification) {
    return /*#__PURE__*/React.createElement("img", {
      src: notification.pixelUrl,
      width: "1",
      height: "1"
    });
  }

  /**
   * Returns the subject of the email.
   *
   * @param props Props in email constructor
   * @returns The email subject as a string
   */

  /**
   * Returns the preview text of the email, this is the text that will be shown
   * in email client list views.
   *
   * @param props Props in email constructor
   * @returns The preview text as a string
   */

  /**
   * Returns a plain-text version of the email, this is the text that will be
   * shown if the email client does not support or want HTML.
   *
   * @param props Props in email constructor
   * @returns The plain text email as a string
   */

  /**
   * Returns a React element that will be rendered on the server to produce the
   * HTML version of the email.
   *
   * @param props Props in email constructor
   * @returns A JSX element
   */

  /**
   * Optionally returns a replyTo email to override the default.
   *
   * @param props Props in email constructor
   * @returns An email address
   */

  /**
   * Returns the unsubscribe URL for the email.
   *
   * @param props Props in email constructor
   * @returns The unsubscribe URL as a string
   */

  /**
   * Allows injecting additional CSS into the head of the email.
   *
   * @param props Props in email constructor
   * @returns A string of CSS
   */

  /**
   * beforeSend hook allows async loading additional data that was not passed
   * through the serialized worker props. If false is returned then the email
   * send is aborted.
   *
   * @param props Props in email constructor
   * @returns A promise resolving to additional data
   */

  /**
   * fromName hook allows overriding the "from" name of the email.
   */

  /**
   * A HTML string to be rendered in the email from a ProseMirror node. The string
   * will be inlined with CSS and have attachments converted to signed URLs.
   *
   * @param team The team the email is being sent to
   * @param node The prosemirror node to render
   * @returns The HTML content as a string, or undefined if team preference.
   */
  async htmlForData(team, node) {
    if (!team?.getPreference(_types.TeamPreference.PreviewsInEmails)) {
      return undefined;
    }
    let content = _ProsemirrorHelper.ProsemirrorHelper.toHTML(node, {
      centered: false
    });
    content = await _TextHelper.TextHelper.attachmentsToSignedUrls(content, team.id, 4 * _time.Day.seconds);
    if (content) {
      // inline all css so that it works in as many email providers as possible.
      return await _HTMLHelper.default.inlineCSS(content);
    }
    return;
  }
}
exports.default = BaseEmail;