"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _i18next = require("i18next");
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _queryString = _interopRequireDefault(require("query-string"));
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _parseDocumentSlug = _interopRequireDefault(require("./../../../../shared/utils/parseDocumentSlug"));
var _errors = require("./../../../../server/errors");
var _Logger = _interopRequireDefault(require("./../../../../server/logging/Logger"));
var _validate = _interopRequireDefault(require("./../../../../server/middlewares/validate"));
var _models = require("./../../../../server/models");
var _SearchHelper = _interopRequireDefault(require("./../../../../server/models/helpers/SearchHelper"));
var _policies = require("./../../../../server/policies");
var _crypto = require("./../../../../server/utils/crypto");
var _i18n = require("./../../../../server/utils/i18n");
var _env = _interopRequireDefault(require("../env"));
var _messageAttachment = require("../presenters/messageAttachment");
var _userNotLinkedBlocks = require("../presenters/userNotLinkedBlocks");
var Slack = _interopRequireWildcard(require("../slack"));
var T = _interopRequireWildcard(require("./schema"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();

// triggered by a user posting a getoutline.com link in Slack
router.post("hooks.unfurl", (0, _validate.default)(T.HooksUnfurlSchema), async ctx => {
  // See URL verification handshake documentation on this page:
  // https://api.slack.com/apis/connections/events-api
  if ("challenge" in ctx.input.body) {
    ctx.body = {
      challenge: ctx.input.body.challenge
    };
    return;
  }
  const {
    token,
    team_id,
    event
  } = ctx.input.body;
  verifySlackToken(token);
  const user = await findUserForRequest(team_id, event.user);
  if (!user) {
    _Logger.default.debug("plugins", "No user found for Slack user ID", {
      providerId: event.user
    });
    return;
  }
  const auth = await _models.IntegrationAuthentication.findOne({
    where: {
      service: _types.IntegrationService.Slack,
      teamId: user.teamId
    }
  });
  if (!auth) {
    _Logger.default.debug("plugins", "No Slack integration authentication found for team", {
      teamId: user.teamId
    });
    return;
  }
  // get content for unfurled links
  const unfurls = {};
  for (const link of event.links) {
    const documentId = (0, _parseDocumentSlug.default)(link.url);
    if (documentId) {
      const doc = await _models.Document.findByPk(documentId, {
        userId: user.id
      });
      if (doc && (0, _policies.can)(user, "read", doc)) {
        const commentId = _queryString.default.parse(link.url.split("?")[1])?.commentId;
        if (commentId) {
          const comment = await _models.Comment.findByPk(commentId);
          if (!comment) {
            continue;
          }
          unfurls[link.url] = {
            title: (0, _i18next.t)(`Comment by {{ author }} on "{{ title }}"`, {
              author: comment.createdBy.name,
              title: doc.title,
              ...(0, _i18n.opts)(user)
            }),
            text: comment.toPlainText()
          };
        } else {
          unfurls[link.url] = {
            title: doc.title,
            text: doc.getSummary(),
            color: doc.collection?.color ?? undefined
          };
        }
      }
    }
  }
  await Slack.post("chat.unfurl", {
    token: auth.token,
    channel: event.channel,
    ts: event.message_ts,
    unfurls
  });
  ctx.body = {
    success: true
  };
});

// triggered by interactions with actions, dialogs, message buttons in Slack
router.post("hooks.interactive", (0, _validate.default)(T.HooksInteractiveSchema), async ctx => {
  const {
    payload
  } = ctx.input.body;
  let callback_id, token;
  try {
    // https://api.slack.com/interactivity/handling#payloads
    const data = JSON.parse(payload);
    const parsed = _zod.z.object({
      type: _zod.z.string(),
      callback_id: _zod.z.string(),
      token: _zod.z.string()
    }).parse(data);
    callback_id = parsed.callback_id;
    token = parsed.token;
  } catch (err) {
    _Logger.default.error("Failed to parse Slack interactive payload", err, {
      payload
    });
    throw (0, _errors.ValidationError)("Invalid payload");
  }
  verifySlackToken(token);

  // we find the document based on the users teamId to ensure access
  const document = await _models.Document.scope("withCollection").findByPk(callback_id);
  if (!document) {
    throw (0, _errors.InvalidRequestError)("Invalid callback_id");
  }
  const team = await _models.Team.findByPk(document.teamId, {
    rejectOnEmpty: true
  });

  // respond with a public message that will be posted in the original channel
  ctx.body = {
    response_type: "in_channel",
    replace_original: false,
    attachments: [(0, _messageAttachment.presentMessageAttachment)(document, team, document.collection, document.getSummary())]
  };
});

// triggered by the /outline command in Slack
router.post("hooks.slack", (0, _validate.default)(T.HooksSlackCommandSchema), async ctx => {
  const {
    token,
    team_id,
    user_id,
    text
  } = ctx.input.body;
  verifySlackToken(token);
  const user = await findUserForRequest(team_id, user_id);

  // Handle "help" command or no input
  if (text.trim() === "help" || !text.trim()) {
    ctx.body = {
      response_type: "ephemeral",
      text: (0, _i18next.t)("How to use {{ command }}", {
        command: "/outline",
        ...(0, _i18n.opts)(user)
      }),
      attachments: [{
        text: (0, _i18next.t)("To search your workspace use {{ command }}. \nType {{ command2 }} help to display this help text.", {
          command: `/outline keyword`,
          command2: `/outline`,
          ...(0, _i18n.opts)(user)
        })
      }]
    };
    return;
  }
  const options = {
    query: text,
    limit: 5
  };
  if (!user) {
    const team = await findTeamForRequest(team_id);
    ctx.body = {
      response_type: "ephemeral",
      blocks: (0, _userNotLinkedBlocks.presentUserNotLinkedBlocks)(team)
    };
    return;
  }
  const {
    results,
    total
  } = await _SearchHelper.default.searchForUser(user, options);
  await _models.SearchQuery.create({
    userId: user ? user.id : null,
    teamId: user.teamId,
    source: "slack",
    query: text,
    results: total
  });

  // Map search results to the format expected by the Slack API
  if (results.length) {
    const attachments = [];
    for (const result of results) {
      const queryIsInTitle = !!result.document.title.toLowerCase().match((0, _escapeRegExp.default)(text.toLowerCase()));
      attachments.push((0, _messageAttachment.presentMessageAttachment)(result.document, user.team, result.document.collection, queryIsInTitle ? undefined : result.context, _env.default.SLACK_MESSAGE_ACTIONS ? [{
        name: "post",
        text: (0, _i18next.t)("Post to Channel", (0, _i18n.opts)(user)),
        type: "button",
        value: result.document.id
      }] : undefined));
    }
    ctx.body = {
      text: (0, _i18next.t)(`This is what we found for "{{ term }}"`, {
        ...(0, _i18n.opts)(user),
        term: text
      }),
      attachments
    };
  } else {
    ctx.body = {
      text: (0, _i18next.t)(`No results for "{{ term }}"`, {
        ...(0, _i18n.opts)(user),
        term: text
      })
    };
  }
});
function verifySlackToken(token) {
  if (!_env.default.SLACK_VERIFICATION_TOKEN) {
    throw (0, _errors.AuthenticationError)("SLACK_VERIFICATION_TOKEN is not present in environment");
  }
  if (!(0, _crypto.safeEqual)(_env.default.SLACK_VERIFICATION_TOKEN, token)) {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }
}

/**
 * Find a matching team for the given Slack team ID
 *
 * @param serviceTeamId The Slack team ID
 * @returns A promise resolving to a matching team, if found
 */
async function findTeamForRequest(serviceTeamId) {
  const authenticationProvider = await _models.AuthenticationProvider.findOne({
    where: {
      name: "slack",
      providerId: serviceTeamId
    },
    include: [{
      required: true,
      model: _models.Team,
      as: "team"
    }]
  });
  if (authenticationProvider) {
    return authenticationProvider.team;
  }
  const integration = await _models.Integration.findOne({
    where: {
      service: _types.IntegrationService.Slack,
      type: _types.IntegrationType.LinkedAccount,
      settings: {
        slack: {
          serviceTeamId
        }
      }
    },
    include: [{
      model: _models.Team,
      as: "team",
      required: true
    }]
  });
  if (integration) {
    return integration.team;
  }
  return;
}

/**
 * Find a matching user for the given Slack team and user ID
 *
 * @param serviceTeamId The Slack team ID
 * @param serviceUserId The Slack user ID
 * @returns A promise resolving to a matching user, if found
 */
async function findUserForRequest(serviceTeamId, serviceUserId) {
  // Prefer explicit linked account
  const integration = await _models.Integration.findOne({
    where: {
      service: _types.IntegrationService.Slack,
      type: _types.IntegrationType.LinkedAccount,
      settings: {
        slack: {
          serviceTeamId,
          serviceUserId
        }
      }
    },
    include: [{
      model: _models.User,
      as: "user",
      required: true
    }, {
      model: _models.Team,
      as: "team",
      required: true
    }],
    order: [["createdAt", "DESC"]]
  });
  if (integration) {
    integration.user.team = integration.team;
    return integration.user;
  }

  // Fallback to authentication provider if the user has Slack sign-in
  const user = await _models.User.findOne({
    include: [{
      where: {
        providerId: serviceUserId
      },
      order: [["createdAt", "DESC"]],
      model: _models.UserAuthentication,
      as: "authentications",
      required: true
    }, {
      model: _models.Team,
      as: "team",
      required: true
    }]
  });
  if (user) {
    return user;
  }
  return;
}
var _default = exports.default = router;