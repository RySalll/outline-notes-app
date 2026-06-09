"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EmbedDescriptor = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _env = _interopRequireDefault(require("../../env"));
var _types = require("../../types");
var _urls = require("../../utils/urls");
var _Img = _interopRequireDefault(require("../components/Img"));
var _Berrycast = _interopRequireDefault(require("./Berrycast"));
var _Diagrams = _interopRequireDefault(require("./Diagrams"));
var _Dropbox = _interopRequireDefault(require("./Dropbox"));
var _Gist = _interopRequireDefault(require("./Gist"));
var _GitLabSnippet = _interopRequireDefault(require("./GitLabSnippet"));
var _InVision = _interopRequireDefault(require("./InVision"));
var _JSFiddle = _interopRequireDefault(require("./JSFiddle"));
var _Linkedin = _interopRequireDefault(require("./Linkedin"));
var _Pinterest = _interopRequireDefault(require("./Pinterest"));
var _Spotify = _interopRequireDefault(require("./Spotify"));
var _Trello = _interopRequireDefault(require("./Trello"));
var _Vimeo = _interopRequireDefault(require("./Vimeo"));
var _YouTube = _interopRequireDefault(require("./YouTube"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const Img = (0, _styledComponents.default)(_Img.default)`
  border-radius: 3px;
  background: #fff;
  box-shadow: 0 0 0 1px ${props => props.theme.divider};
  margin: 3px;
  width: 18px;
  height: 18px;
`;
class EmbedDescriptor {
  constructor(options) {
    /** An icon that will be used to represent the embed in menus */
    _defineProperty(this, "icon", void 0);
    /** The name of the embed. If this embed has a matching integration it should match IntegrationService */
    _defineProperty(this, "name", void 0);
    /** The title of the embed */
    _defineProperty(this, "title", void 0);
    /** A placeholder that will be shown in the URL input */
    _defineProperty(this, "placeholder", void 0);
    /** A keyboard shortcut that will trigger the embed */
    _defineProperty(this, "shortcut", void 0);
    /** Keywords that will match this embed in menus */
    _defineProperty(this, "keywords", void 0);
    /** A tooltip that will be shown in menus */
    _defineProperty(this, "tooltip", void 0);
    /** Whether the embed should be hidden in menus by default */
    _defineProperty(this, "defaultHidden", void 0);
    /** Whether the bottom toolbar should be hidden – use this when the embed itself includes a footer */
    _defineProperty(this, "hideToolbar", void 0);
    /** Whether the embed should match automatically when pasting a URL (default to true) */
    _defineProperty(this, "matchOnInput", void 0);
    /** A regex that will be used to match the embed from a URL. */
    _defineProperty(this, "regexMatch", void 0);
    /**
     * A function that will be used to transform the URL. The resulting string is passed as the src
     * to the iframe. You can perform any transformations you want here, including changing the domain
     *
     * If a custom display is needed this function should be left undefined and `component` should be
     * used instead.
     */
    _defineProperty(this, "transformMatch", void 0);
    /** The node attributes */
    _defineProperty(this, "attrs", void 0);
    /** Whether the embed should be visible in menus, always true */
    _defineProperty(this, "visible", void 0);
    /**
     * A React component that will be used to render the embed, if displaying a simple iframe then
     * `transformMatch` should be used instead.
     */
    _defineProperty(this, "component", void 0);
    /** The integration settings, if any */
    _defineProperty(this, "settings", void 0);
    this.icon = options.icon;
    this.name = options.name;
    this.title = options.title;
    this.placeholder = options.placeholder;
    this.shortcut = options.shortcut;
    this.keywords = options.keywords;
    this.tooltip = options.tooltip;
    this.defaultHidden = options.defaultHidden;
    this.hideToolbar = options.hideToolbar;
    this.matchOnInput = options.matchOnInput ?? true;
    this.regexMatch = options.regexMatch;
    this.transformMatch = options.transformMatch;
    this.attrs = options.attrs;
    this.visible = options.visible;
    this.component = options.component;
  }
  matcher(url) {
    const regexes = this.regexMatch ?? [];
    const settingsDomainRegex = this.settings?.url ? (0, _urls.urlRegex)(this.settings?.url) : undefined;
    if (settingsDomainRegex) {
      regexes.unshift(settingsDomainRegex);
    }
    for (const regex of regexes) {
      const result = url.match(regex);
      if (result) {
        return result;
      }
    }
    return false;
  }
}
exports.EmbedDescriptor = EmbedDescriptor;
const embeds = [new EmbedDescriptor({
  title: "Abstract",
  keywords: "design",
  defaultHidden: true,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/abstract.png",
    alt: "Abstract"
  }),
  regexMatch: [new RegExp("^https?://share\\.(?:go)?abstract\\.com/(.*)$"), new RegExp("^https?://app\\.(?:go)?abstract\\.com/(?:share|embed)/(.*)$")],
  transformMatch: matches => `https://app.goabstract.com/embed/${matches[1]}`
}), new EmbedDescriptor({
  title: "Airtable",
  keywords: "spreadsheet",
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/airtable.png",
    alt: "Airtable"
  }),
  regexMatch: [new RegExp("^https://airtable.com/(?:embed/)?(app.*/)?(shr.*)$"), new RegExp("^https://airtable.com/(app.*/)?(pag.*)/form$")],
  transformMatch: matches => `https://airtable.com/embed/${matches[1] ?? ""}${matches[2]}`
}), new EmbedDescriptor({
  title: "Berrycast",
  keywords: "video",
  defaultHidden: true,
  regexMatch: [/^https:\/\/(www\.)?berrycast.com\/conversations\/(.*)$/i],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/berrycast.png",
    alt: "Berrycast"
  }),
  component: _Berrycast.default
}), new EmbedDescriptor({
  title: "Bilibili",
  keywords: "video",
  defaultHidden: true,
  regexMatch: [/(?:https?:\/\/)?(www\.bilibili\.com)\/video\/([\w\d]+)?(\?\S+)?/i],
  transformMatch: matches => `https://player.bilibili.com/player.html?bvid=${matches[2]}&page=1&high_quality=1&autoplay=0`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/bilibili.png",
    alt: "Bilibili"
  })
}), new EmbedDescriptor({
  title: "Camunda Modeler",
  keywords: "bpmn process cawemo",
  defaultHidden: true,
  regexMatch: [new RegExp("^https?://modeler.cloud.camunda.io/(?:share|embed)/(.*)$")],
  transformMatch: matches => `https://modeler.cloud.camunda.io/embed/${matches[1]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/camunda.png",
    alt: "Camunda"
  })
}), new EmbedDescriptor({
  title: "Canva",
  keywords: "design",
  regexMatch: [/^https:\/\/(?:www\.)?canva\.com\/design\/([\/a-zA-Z0-9_\-]*)$/],
  transformMatch: matches => {
    const input = matches.input ?? matches[0];
    try {
      const url = new URL(input);
      const params = new URLSearchParams(url.search);
      params.append("embed", "");
      return `${url.origin}${url.pathname}?${params.toString()}`;
    } catch (e) {
      //
    }
    return input;
  },
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/canva.png",
    alt: "Canva"
  })
}), new EmbedDescriptor({
  title: "Cawemo",
  keywords: "bpmn process",
  defaultHidden: true,
  regexMatch: [new RegExp("^https?://cawemo.com/(?:share|embed)/(.*)$")],
  transformMatch: matches => `https://cawemo.com/embed/${matches[1]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/cawemo.png",
    alt: "Cawemo"
  })
}), new EmbedDescriptor({
  title: "ClickUp",
  keywords: "project",
  regexMatch: [new RegExp("^https?://share\\.clickup\\.com/[a-z]/[a-z]/(.*)/(.*)$"), new RegExp("^https?://sharing\\.clickup\\.com/[0-9]+/[a-z]/[a-z]/(.*)/(.*)$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/clickup.png",
    alt: "ClickUp"
  })
}), new EmbedDescriptor({
  title: "Codepen",
  keywords: "code editor",
  regexMatch: [new RegExp("^https://codepen.io/(.*?)/(pen|embed)/(.*)$")],
  transformMatch: matches => `https://codepen.io/${matches[1]}/embed/${matches[3]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/codepen.png",
    alt: "Codepen"
  })
}), new EmbedDescriptor({
  title: "DBDiagram",
  keywords: "diagrams database",
  regexMatch: [new RegExp("^https://dbdiagram.io/(embed|e|d)/(\\w+)(/.*)?$")],
  transformMatch: matches => `https://dbdiagram.io/embed/${matches[2]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/dbdiagram.png",
    alt: "DBDiagram"
  })
}), new EmbedDescriptor({
  title: "Diagrams.net",
  name: _types.IntegrationService.Diagrams,
  keywords: "diagrams drawio",
  regexMatch: [/^https:\/\/viewer\.diagrams\.net\/(?!proxy).*(title=\\w+)?/],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/diagrams.png",
    alt: "Diagrams.net"
  }),
  component: _Diagrams.default
}), new EmbedDescriptor({
  title: "Descript",
  keywords: "audio",
  regexMatch: [new RegExp("^https?://share\\.descript\\.com/view/(\\w+)$")],
  transformMatch: matches => `https://share.descript.com/embed/${matches[1]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/descript.png",
    alt: "Descript"
  })
}), ...(_env.default.DROPBOX_APP_KEY ? [new EmbedDescriptor({
  title: "Dropbox",
  keywords: "file document",
  regexMatch: [new RegExp("^https?://(www.)?dropbox.com/(s|scl)/(.*)$")],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/dropbox.png",
    alt: "Dropbox"
  }),
  component: _Dropbox.default
})] : []), new EmbedDescriptor({
  title: "Figma",
  keywords: "design svg vector",
  regexMatch: [new RegExp("^https://([w.-]+\\.)?figma\\.com/(file|proto|board|design)/([0-9a-zA-Z]{22,128})(?:/.*)?$"), new RegExp("^https://([w.-]+\\.)?figma\\.com/embed(.*)$")],
  transformMatch: matches => {
    if (matches[0].includes("/embed")) {
      return matches[0];
    }
    return `https://www.figma.com/embed?embed_host=outline&url=${encodeURIComponent(matches[0])}`;
  },
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/figma.png",
    alt: "Figma"
  })
}), new EmbedDescriptor({
  title: "Framer",
  keywords: "design prototyping",
  regexMatch: [new RegExp("^https://framer.cloud/(.*)$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/framer.png",
    alt: "Framer"
  })
}), new EmbedDescriptor({
  title: "GitHub Gist",
  keywords: "code",
  regexMatch: [new RegExp("^https://gist\\.github\\.com/([a-zA-Z\\d](?:[a-zA-Z\\d]|-(?=[a-zA-Z\\d])){0,38})/(.*)$")],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/github-gist.png",
    alt: "GitHub"
  }),
  component: _Gist.default
}), new EmbedDescriptor({
  title: "GitLab Snippet",
  keywords: "code",
  regexMatch: [new RegExp(`^https://gitlab\\.com/(([a-zA-Z\\d-]+)/)*-/snippets/\\d+$`)],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/gitlab.png",
    alt: "GitLab"
  }),
  component: _GitLabSnippet.default
}), new EmbedDescriptor({
  title: "Gliffy",
  keywords: "diagram",
  regexMatch: [new RegExp("https?://go\\.gliffy\\.com/go/share/(.*)$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/gliffy.png",
    alt: "Gliffy"
  })
}), new EmbedDescriptor({
  title: "Google Maps",
  keywords: "maps",
  regexMatch: [new RegExp("^https?://www\\.google\\.com/maps/embed\\?(.*)$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-maps.png",
    alt: "Google Maps"
  }),
  visible: true
}), new EmbedDescriptor({
  title: "Google Drawings",
  keywords: "drawings",
  transformMatch: matches => matches[0].replace("/edit", "/preview"),
  regexMatch: [new RegExp("^https://docs\\.google\\.com/drawings/d/(.*)/(edit|preview)(.*)$")],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-drawings.png",
    alt: "Google Drawings"
  })
}), new EmbedDescriptor({
  title: "Google Drive",
  keywords: "drive",
  regexMatch: [new RegExp("^https?://drive\\.google\\.com/file/d/(.*)$")],
  transformMatch: matches => matches[0].replace("/view", "/preview").replace("/edit", "/preview"),
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-drive.png",
    alt: "Google Drive"
  })
}), new EmbedDescriptor({
  title: "Google Docs",
  keywords: "documents word",
  regexMatch: [new RegExp("^https?://docs\\.google\\.com/document/(.*)$")],
  transformMatch: matches => matches[0].replace("/view", "/preview").replace("/edit", "/preview"),
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-docs.png",
    alt: "Google Docs"
  })
}), new EmbedDescriptor({
  title: "Google Sheets",
  keywords: "excel spreadsheet",
  regexMatch: [new RegExp("^https?://docs\\.google\\.com/spreadsheets/d/(.*)$")],
  transformMatch: matches => matches[0].replace("/view", "/preview").replace("/edit", "/preview"),
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-sheets.png",
    alt: "Google Sheets"
  })
}), new EmbedDescriptor({
  title: "Google Slides",
  keywords: "presentation slideshow",
  regexMatch: [new RegExp("^https?://docs\\.google\\.com/presentation/d/(.*)$")],
  transformMatch: matches => matches[0].replace("/edit", "/preview").replace("/pub", "/embed"),
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-slides.png",
    alt: "Google Slides"
  })
}), new EmbedDescriptor({
  title: "Google Calendar",
  keywords: "calendar",
  regexMatch: [new RegExp("^https?://calendar\\.google\\.com/calendar/embed\\?src=(.*)$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-calendar.png",
    alt: "Google Calendar"
  })
}), new EmbedDescriptor({
  title: "Google Forms",
  keywords: "form survey",
  regexMatch: [new RegExp("^https?://docs\\.google\\.com/forms/d/(.+)$")],
  transformMatch: matches => matches[0].replace(/\/(edit|viewform)(\?.+)?$/, "/viewform?embedded=true"),
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-forms.png",
    alt: "Google Forms"
  })
}), new EmbedDescriptor({
  title: "Google Looker Studio",
  keywords: "bi business intelligence",
  regexMatch: [new RegExp("^https?://(lookerstudio|datastudio)\\.google\\.com/(embed|u/0)/reporting/(.*)/page/(.*)(/edit)?$")],
  transformMatch: matches => matches[0].replace("u/0", "embed").replace("/edit", ""),
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/google-lookerstudio.png",
    alt: "Google Looker Studio"
  })
}), new EmbedDescriptor({
  title: "Grist",
  name: _types.IntegrationService.Grist,
  keywords: "spreadsheet",
  regexMatch: [new RegExp("^https?://([a-z.-]+\\.)?getgrist\\.com/(.+)$")],
  transformMatch: matches => {
    const input = matches.input ?? matches[0];
    try {
      const url = new URL(input);
      const params = new URLSearchParams(url.search);
      if (params.has("embed") || params.get("style") === "singlePage") {
        return input;
      }
      params.append("embed", "true");
      return `${url.origin}${url.pathname}?${params.toString()}`;
    } catch (e) {
      //
    }
    return input;
  },
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/grist.png",
    alt: "Grist"
  })
}), new EmbedDescriptor({
  title: "Instagram",
  keywords: "post",
  regexMatch: [/^https?:\/\/www\.instagram\.com\/(p|reel)\/([\w-]+)(\/?utm_source=\w+)?/],
  transformMatch: matches => `${matches[0]}/embed`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/instagram.png",
    alt: "Instagram"
  })
}), new EmbedDescriptor({
  title: "InVision",
  keywords: "design prototype",
  defaultHidden: true,
  regexMatch: [/^https:\/\/(invis\.io\/.*)|(projects\.invisionapp\.com\/share\/.*)$/, /^https:\/\/(opal\.invisionapp\.com\/static-signed\/live-embed\/.*)$/],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/invision.png",
    alt: "InVision"
  }),
  component: _InVision.default
}), new EmbedDescriptor({
  title: "JSFiddle",
  keywords: "code",
  defaultHidden: true,
  regexMatch: [new RegExp("^https?://jsfiddle\\.net/(.*)/(.*)$")],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/jsfiddle.png",
    alt: "JSFiddle"
  }),
  component: _JSFiddle.default
}), new EmbedDescriptor({
  title: "LinkedIn",
  keywords: "post",
  defaultHidden: true,
  regexMatch: [/^https:\/\/www\.linkedin\.com\/(?:posts\/.*-(ugcPost|activity)-(\d+)-.*|(embed)\/(?:feed\/update\/urn:li:(?:ugcPost|share):(?:\d+)))/],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/linkedin.png",
    alt: "LinkedIn"
  }),
  component: _Linkedin.default
}), new EmbedDescriptor({
  title: "Loom",
  keywords: "video screencast",
  regexMatch: [/^https:\/\/(www\.)?(use)?loom\.com\/(embed|share)\/(.*)$/],
  transformMatch: matches => matches[0].replace("share", "embed"),
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/loom.png",
    alt: "Loom"
  })
}), new EmbedDescriptor({
  title: "Lucidchart",
  keywords: "chart",
  regexMatch: [/^https?:\/\/(www\.|app\.)?(lucidchart\.com|lucid\.app)\/documents\/(embeddedchart|view|edit)\/(?<chartId>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:.*)?$/, /^https?:\/\/(www\.|app\.)?(lucid\.app|lucidchart\.com)\/lucidchart\/(?<chartId>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\/(embeddedchart|view|edit)(?:.*)?$/],
  transformMatch: matches => `https://lucidchart.com/documents/embeddedchart/${matches.groups?.chartId}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/lucidchart.png",
    alt: "Lucidchart"
  })
}), new EmbedDescriptor({
  title: "Marvel",
  keywords: "design prototype",
  regexMatch: [new RegExp("^https://marvelapp\\.com/([A-Za-z0-9-]{6})/?$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/marvel.png",
    alt: "Marvel"
  })
}), new EmbedDescriptor({
  title: "Mindmeister",
  keywords: "mindmap",
  regexMatch: [new RegExp("^https://([w.-]+\\.)?(mindmeister\\.com|mm\\.tt)(/maps/public_map_shell)?/(\\d+)(\\?t=.*)?(/.*)?$")],
  transformMatch: matches => {
    const chartId = matches[4] + (matches[5] || "") + (matches[6] || "");
    return `https://www.mindmeister.com/maps/public_map_shell/${chartId}`;
  },
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/mindmeister.png",
    alt: "Mindmeister"
  })
}), new EmbedDescriptor({
  title: "Miro",
  keywords: "whiteboard",
  regexMatch: [/^https:\/\/(realtimeboard|miro)\.com\/app\/board\/(.*)$/],
  transformMatch: matches => `https://${matches[1]}.com/app/embed/${matches[2]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/miro.png",
    alt: "Miro"
  })
}), new EmbedDescriptor({
  title: "Mode",
  keywords: "analytics",
  defaultHidden: true,
  regexMatch: [new RegExp("^https://([w.-]+\\.)?modeanalytics\\.com/(.*)/reports/(.*)$")],
  transformMatch: matches => `${matches[0].replace(/\/embed$/, "")}/embed`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/mode-analytics.png",
    alt: "Mode"
  })
}), new EmbedDescriptor({
  title: "Otter.ai",
  keywords: "audio transcription meeting notes",
  defaultHidden: true,
  regexMatch: [new RegExp("^https?://otter\\.ai/[su]/(.*)$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/otter.png",
    alt: "Otter.ai"
  })
}), new EmbedDescriptor({
  title: "Pitch",
  keywords: "presentation",
  defaultHidden: true,
  regexMatch: [new RegExp("^https?://app\\.pitch\\.com/app/(?:presentation/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|public/player)/(.*)$"), new RegExp("^https?://pitch\\.com/embed/(.*)$")],
  transformMatch: matches => `https://pitch.com/embed/${matches[1]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/pitch.png",
    alt: "Pitch"
  })
}), new EmbedDescriptor({
  title: "Prezi",
  keywords: "presentation",
  regexMatch: [new RegExp("^https://prezi\\.com/view/(.*)$")],
  transformMatch: matches => `${matches[0].replace(/\/embed$/, "")}/embed`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/prezi.png",
    alt: "Prezi"
  })
}), new EmbedDescriptor({
  title: "Scribe",
  keywords: "screencast",
  regexMatch: [/^https?:\/\/scribehow\.com\/shared\/(.*)$/],
  transformMatch: matches => `https://scribehow.com/embed/${matches[1]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/scribe.png",
    alt: "Scribe"
  })
}), new EmbedDescriptor({
  title: "SmartSuite",
  regexMatch: [new RegExp("^https?://app\\.smartsuite\\.com/shared/(.*)(?:\\?)?(?:.*)$")],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/smartsuite.png",
    alt: "SmartSuite"
  }),
  defaultHidden: true,
  hideToolbar: true,
  transformMatch: matches => `https://app.smartsuite.com/shared/${matches[1]}?embed=true&header=false&toolbar=true`
}), new EmbedDescriptor({
  title: "Spotify",
  keywords: "music",
  regexMatch: [new RegExp("^https?://open\\.spotify\\.com/(.*)$")],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/spotify.png",
    alt: "Spotify"
  }),
  component: _Spotify.default
}), new EmbedDescriptor({
  title: "Tldraw",
  keywords: "draw schematics diagrams",
  regexMatch: [new RegExp("^https?://(beta|www|old)\\.tldraw\\.com/[rsvo]+/(.*)")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/tldraw.png",
    alt: "Tldraw"
  })
}), new EmbedDescriptor({
  title: "Trello",
  keywords: "kanban",
  regexMatch: [/^https:\/\/trello\.com\/(c|b)\/([^/]*)(.*)?$/],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/trello.png",
    alt: "Trello"
  }),
  component: _Trello.default
}), new EmbedDescriptor({
  title: "Typeform",
  keywords: "form survey",
  regexMatch: [new RegExp("^https://([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)\\.typeform\\.com/to/(.*)$")],
  transformMatch: matches => matches[0],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/typeform.png",
    alt: "Typeform"
  })
}), new EmbedDescriptor({
  title: "Valtown",
  keywords: "code",
  regexMatch: [/^https?:\/\/(?:www.)?val\.town\/(?:v|embed)\/(.*)$/],
  transformMatch: matches => `https://www.val.town/embed/${matches[1]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/valtown.png",
    alt: "Valtown"
  })
}), new EmbedDescriptor({
  title: "Vimeo",
  keywords: "video",
  regexMatch: [/(http|https)?:\/\/(www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|)(\d+)(?:\/|\?)?([\d\w]+)?/],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/vimeo.png",
    alt: "Vimeo"
  }),
  component: _Vimeo.default
}), new EmbedDescriptor({
  title: "Pinterest",
  keywords: "board moodboard pins",
  regexMatch: [
  // Match board URLs but exclude pins
  /^(?:https?:\/\/)?(?:(?:www\.|[a-z]{2}\.)?pinterest\.(?:com|[a-z]{2,3}))\/(?!pin\/)([^/]+)\/([^/]+)\/?$/,
  // Match profile URLs but exclude pins
  /^(?:https?:\/\/)?(?:(?:www\.|[a-z]{2}\.)?pinterest\.(?:com|[a-z]{2,3}))\/(?!pin\/)([^/]+)\/?$/],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/pinterest.png",
    alt: "Pinterest"
  }),
  component: _Pinterest.default
}), new EmbedDescriptor({
  title: "Whimsical",
  keywords: "whiteboard",
  regexMatch: [/^https?:\/\/whimsical\.com\/[0-9a-zA-Z-_~]*-([a-zA-Z0-9]+)\/?$/],
  transformMatch: matches => `https://whimsical.com/embed/${matches[1]}`,
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/whimsical.png",
    alt: "Whimsical"
  })
}), new EmbedDescriptor({
  title: "YouTube",
  keywords: "google video",
  regexMatch: [/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})([\&\?](.*))?$/i],
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/youtube.png",
    alt: "YouTube"
  }),
  component: _YouTube.default
}), /* The generic iframe embed should always be the last one */
new EmbedDescriptor({
  title: "Embed",
  keywords: "iframe webpage",
  placeholder: "Paste a URL to embed",
  icon: /*#__PURE__*/React.createElement(Img, {
    src: "/images/embed.png",
    alt: "Embed"
  }),
  defaultHidden: false,
  matchOnInput: false,
  regexMatch: [new RegExp("^https?://(.*)$")],
  transformMatch: matches => matches[0],
  hideToolbar: true
})];
var _default = exports.default = embeds;