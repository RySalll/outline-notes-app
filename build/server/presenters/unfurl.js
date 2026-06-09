"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _i18next = require("i18next");
var _types = require("./../../shared/types");
var _date = require("./../../shared/utils/date");
var _models = require("./../models");
var _i18n = require("./../utils/i18n");
var _GitHubUtils = require("./../../plugins/github/shared/GitHubUtils");
async function presentUnfurl(data, options) {
  switch (data.type) {
    case _types.UnfurlResourceType.Mention:
      return presentMention(data, options);
    case _types.UnfurlResourceType.Document:
      return presentDocument(data);
    case _types.UnfurlResourceType.PR:
      return presentPR(data);
    case _types.UnfurlResourceType.Issue:
      return presentIssue(data);
    default:
      return presentOEmbed(data);
  }
}
const presentOEmbed = data => ({
  type: _types.UnfurlResourceType.OEmbed,
  url: data.url,
  title: data.title,
  description: data.description,
  thumbnailUrl: data.thumbnail_url
});
const presentMention = async (data, options) => {
  const user = data.user;
  const document = data.document;
  const lastOnlineInfo = presentLastOnlineInfoFor(user);
  const lastViewedInfo = await presentLastViewedInfoFor(user, document);
  return {
    type: _types.UnfurlResourceType.Mention,
    name: user.name,
    email: options && options.includeEmail ? user.email : null,
    avatarUrl: user.avatarUrl,
    color: user.color,
    lastActive: `${lastOnlineInfo} • ${lastViewedInfo}`
  };
};
const presentDocument = data => {
  const document = data.document;
  const viewer = data.viewer;
  return {
    url: document.url,
    type: _types.UnfurlResourceType.Document,
    id: document.id,
    title: document.titleWithDefault,
    summary: document.getSummary(),
    lastActivityByViewer: presentLastActivityInfoFor(document, viewer)
  };
};
const presentPR = data => ({
  url: data.html_url,
  type: _types.UnfurlResourceType.PR,
  id: `#${data.number}`,
  title: data.title,
  description: data.body,
  author: {
    name: data.user.login,
    avatarUrl: data.user.avatar_url
  },
  state: {
    name: data.merged ? "merged" : data.state,
    color: _GitHubUtils.GitHubUtils.getColorForStatus(data.merged ? "merged" : data.state)
  },
  createdAt: data.created_at
});
const presentIssue = data => ({
  url: data.html_url,
  type: _types.UnfurlResourceType.Issue,
  id: `#${data.number}`,
  title: data.title,
  description: data.body_text,
  author: {
    name: data.user.login,
    avatarUrl: data.user.avatar_url
  },
  labels: data.labels.map(label => ({
    name: label.name,
    color: `#${label.color}`
  })),
  state: {
    name: data.state,
    color: _GitHubUtils.GitHubUtils.getColorForStatus(data.state === "closed" ? "done" : data.state)
  },
  createdAt: data.created_at
});
const presentLastOnlineInfoFor = user => {
  const locale = (0, _date.dateLocale)(user.language);
  let info;
  if (!user.lastActiveAt) {
    info = (0, _i18next.t)("Never logged in", {
      ...(0, _i18n.opts)(user)
    });
  } else if ((0, _dateFns.differenceInMinutes)(new Date(), user.lastActiveAt) < 5) {
    info = (0, _i18next.t)("Online now", {
      ...(0, _i18n.opts)(user)
    });
  } else {
    info = (0, _i18next.t)("Online {{ timeAgo }}", {
      timeAgo: (0, _dateFns.formatDistanceToNowStrict)(user.lastActiveAt, {
        addSuffix: true,
        locale
      }),
      ...(0, _i18n.opts)(user)
    });
  }
  return info;
};
const presentLastViewedInfoFor = async (user, document) => {
  const lastView = await _models.View.findOne({
    where: {
      userId: user.id,
      documentId: document.id
    },
    order: [["updatedAt", "DESC"]]
  });
  const lastViewedAt = lastView ? lastView.updatedAt : undefined;
  const locale = (0, _date.dateLocale)(user.language);
  let info;
  if (!lastViewedAt) {
    info = (0, _i18next.t)("Never viewed", {
      ...(0, _i18n.opts)(user)
    });
  } else if ((0, _dateFns.differenceInMinutes)(new Date(), lastViewedAt) < 5) {
    info = (0, _i18next.t)("Viewed just now", {
      ...(0, _i18n.opts)(user)
    });
  } else {
    info = (0, _i18next.t)("Viewed {{ timeAgo }}", {
      timeAgo: (0, _dateFns.formatDistanceToNowStrict)(lastViewedAt, {
        addSuffix: true,
        locale
      }),
      ...(0, _i18n.opts)(user)
    });
  }
  return info;
};
const presentLastActivityInfoFor = (document, viewer) => {
  const locale = (0, _date.dateLocale)(viewer.language);
  const wasUpdated = document.createdAt !== document.updatedAt;
  let info;
  if (wasUpdated) {
    const lastUpdatedByViewer = document.updatedBy.id === viewer.id;
    if (lastUpdatedByViewer) {
      info = (0, _i18next.t)("You updated {{ timeAgo }}", {
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.updatedAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    } else {
      info = (0, _i18next.t)("{{ user }} updated {{ timeAgo }}", {
        user: document.updatedBy.name,
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.updatedAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    }
  } else {
    const lastCreatedByViewer = document.createdById === viewer.id;
    if (lastCreatedByViewer) {
      info = (0, _i18next.t)("You created {{ timeAgo }}", {
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.createdAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    } else {
      info = (0, _i18next.t)("{{ user }} created {{ timeAgo }}", {
        user: document.createdBy.name,
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.createdAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    }
  }
  return info;
};
var _default = exports.default = presentUnfurl;