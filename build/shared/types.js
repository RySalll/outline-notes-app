"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserRole = exports.UserPreference = exports.UserCreatableIntegrationService = exports.UnfurlResourceType = exports.TeamPreference = exports.TOCPosition = exports.StatusFilter = exports.QueryNotices = exports.NotificationEventType = exports.NotificationEventDefaults = exports.NotificationChannelType = exports.NavigationNodeType = exports.MentionType = exports.IntegrationType = exports.IntegrationService = exports.IconType = exports.FileOperationType = exports.FileOperationState = exports.FileOperationFormat = exports.ExportContentType = exports.EmojiSkinTone = exports.EmojiCategory = exports.DocumentPermission = exports.CommentStatusFilter = exports.CollectionStatusFilter = exports.CollectionPermission = exports.Client = exports.AttachmentPreset = void 0;
let UserRole = exports.UserRole = /*#__PURE__*/function (UserRole) {
  UserRole["Admin"] = "admin";
  UserRole["Member"] = "member";
  UserRole["Viewer"] = "viewer";
  UserRole["Guest"] = "guest";
  return UserRole;
}({});
let StatusFilter = exports.StatusFilter = /*#__PURE__*/function (StatusFilter) {
  StatusFilter["Published"] = "published";
  StatusFilter["Archived"] = "archived";
  StatusFilter["Draft"] = "draft";
  return StatusFilter;
}({});
let CollectionStatusFilter = exports.CollectionStatusFilter = /*#__PURE__*/function (CollectionStatusFilter) {
  CollectionStatusFilter["Archived"] = "archived";
  return CollectionStatusFilter;
}({});
let CommentStatusFilter = exports.CommentStatusFilter = /*#__PURE__*/function (CommentStatusFilter) {
  CommentStatusFilter["Resolved"] = "resolved";
  CommentStatusFilter["Unresolved"] = "unresolved";
  return CommentStatusFilter;
}({});
let Client = exports.Client = /*#__PURE__*/function (Client) {
  Client["Web"] = "web";
  Client["Desktop"] = "desktop";
  return Client;
}({});
let ExportContentType = exports.ExportContentType = /*#__PURE__*/function (ExportContentType) {
  ExportContentType["Markdown"] = "text/markdown";
  ExportContentType["Html"] = "text/html";
  ExportContentType["Pdf"] = "application/pdf";
  return ExportContentType;
}({});
let FileOperationFormat = exports.FileOperationFormat = /*#__PURE__*/function (FileOperationFormat) {
  FileOperationFormat["JSON"] = "json";
  FileOperationFormat["MarkdownZip"] = "outline-markdown";
  FileOperationFormat["HTMLZip"] = "html";
  FileOperationFormat["PDF"] = "pdf";
  FileOperationFormat["Notion"] = "notion";
  return FileOperationFormat;
}({});
let FileOperationType = exports.FileOperationType = /*#__PURE__*/function (FileOperationType) {
  FileOperationType["Import"] = "import";
  FileOperationType["Export"] = "export";
  return FileOperationType;
}({});
let FileOperationState = exports.FileOperationState = /*#__PURE__*/function (FileOperationState) {
  FileOperationState["Creating"] = "creating";
  FileOperationState["Uploading"] = "uploading";
  FileOperationState["Complete"] = "complete";
  FileOperationState["Error"] = "error";
  FileOperationState["Expired"] = "expired";
  return FileOperationState;
}({});
let MentionType = exports.MentionType = /*#__PURE__*/function (MentionType) {
  MentionType["User"] = "user";
  MentionType["Document"] = "document";
  return MentionType;
}({});
let AttachmentPreset = exports.AttachmentPreset = /*#__PURE__*/function (AttachmentPreset) {
  AttachmentPreset["DocumentAttachment"] = "documentAttachment";
  AttachmentPreset["WorkspaceImport"] = "workspaceImport";
  AttachmentPreset["Import"] = "import";
  AttachmentPreset["Avatar"] = "avatar";
  return AttachmentPreset;
}({});
let IntegrationType = exports.IntegrationType = /*#__PURE__*/function (IntegrationType) {
  /** An integration that posts updates to an external system. */
  IntegrationType["Post"] = "post";
  /** An integration that listens for commands from an external system. */
  IntegrationType["Command"] = "command";
  /** An integration that embeds content from an external system. */
  IntegrationType["Embed"] = "embed";
  /** An integration that captures analytics data. */
  IntegrationType["Analytics"] = "analytics";
  /** An integration that maps an Outline user to an external service. */
  IntegrationType["LinkedAccount"] = "linkedAccount";
  return IntegrationType;
}({});
let IntegrationService = exports.IntegrationService = /*#__PURE__*/function (IntegrationService) {
  IntegrationService["Diagrams"] = "diagrams";
  IntegrationService["Grist"] = "grist";
  IntegrationService["Slack"] = "slack";
  IntegrationService["GoogleAnalytics"] = "google-analytics";
  IntegrationService["Matomo"] = "matomo";
  IntegrationService["Umami"] = "umami";
  IntegrationService["GitHub"] = "github";
  return IntegrationService;
}({});
const UserCreatableIntegrationService = exports.UserCreatableIntegrationService = {
  Diagrams: IntegrationService.Diagrams,
  Grist: IntegrationService.Grist,
  GoogleAnalytics: IntegrationService.GoogleAnalytics,
  Matomo: IntegrationService.Matomo,
  Umami: IntegrationService.Umami
};
let CollectionPermission = exports.CollectionPermission = /*#__PURE__*/function (CollectionPermission) {
  CollectionPermission["Read"] = "read";
  CollectionPermission["ReadWrite"] = "read_write";
  CollectionPermission["Admin"] = "admin";
  return CollectionPermission;
}({});
let DocumentPermission = exports.DocumentPermission = /*#__PURE__*/function (DocumentPermission) {
  DocumentPermission["Read"] = "read";
  DocumentPermission["ReadWrite"] = "read_write";
  DocumentPermission["Admin"] = "admin";
  return DocumentPermission;
}({});
let UserPreference = exports.UserPreference = /*#__PURE__*/function (UserPreference) {
  /** Whether reopening the app should redirect to the last viewed document. */
  UserPreference["RememberLastPath"] = "rememberLastPath";
  /** If web-style hand pointer should be used on interactive elements. */
  UserPreference["UseCursorPointer"] = "useCursorPointer";
  /** Whether code blocks should show line numbers. */
  UserPreference["CodeBlockLineNumers"] = "codeBlockLineNumbers";
  /** Whether documents have a separate edit mode instead of always editing. */
  UserPreference["SeamlessEdit"] = "seamlessEdit";
  /** Whether documents should start in full-width mode. */
  UserPreference["FullWidthDocuments"] = "fullWidthDocuments";
  /** Whether to sort the comments by their order in the document. */
  UserPreference["SortCommentsByOrderInDocument"] = "sortCommentsByOrderInDocument";
  /** Whether smart text replacements should be enabled. */
  UserPreference["EnableSmartText"] = "enableSmartText";
  return UserPreference;
}({});
let TOCPosition = exports.TOCPosition = /*#__PURE__*/function (TOCPosition) {
  TOCPosition["Left"] = "left";
  TOCPosition["Right"] = "right";
  return TOCPosition;
}({});
let TeamPreference = exports.TeamPreference = /*#__PURE__*/function (TeamPreference) {
  /** Whether documents have a separate edit mode instead of always editing. */
  TeamPreference["SeamlessEdit"] = "seamlessEdit";
  /** Whether to use team logo across the app for branding. */
  TeamPreference["PublicBranding"] = "publicBranding";
  /** Whether viewers should see download options. */
  TeamPreference["ViewersCanExport"] = "viewersCanExport";
  /** Whether members can invite new users. */
  TeamPreference["MembersCanInvite"] = "membersCanInvite";
  /** Whether members can create API keys. */
  TeamPreference["MembersCanCreateApiKey"] = "membersCanCreateApiKey";
  /** Whether members can delete their user account. */
  TeamPreference["MembersCanDeleteAccount"] = "membersCanDeleteAccount";
  /** Whether notification emails include document and comment content. */
  TeamPreference["PreviewsInEmails"] = "previewsInEmails";
  /** Whether users can comment on documents. */
  TeamPreference["Commenting"] = "commenting";
  /** The custom theme for the team. */
  TeamPreference["CustomTheme"] = "customTheme";
  /** Side to display the document's table of contents in relation to the main content. */
  TeamPreference["TocPosition"] = "tocPosition";
  return TeamPreference;
}({});
let NavigationNodeType = exports.NavigationNodeType = /*#__PURE__*/function (NavigationNodeType) {
  NavigationNodeType["Collection"] = "collection";
  NavigationNodeType["Document"] = "document";
  NavigationNodeType["UserMembership"] = "userMembership";
  NavigationNodeType["GroupMembership"] = "groupMembership";
  return NavigationNodeType;
}({});
let NotificationEventType = exports.NotificationEventType = /*#__PURE__*/function (NotificationEventType) {
  NotificationEventType["PublishDocument"] = "documents.publish";
  NotificationEventType["UpdateDocument"] = "documents.update";
  NotificationEventType["AddUserToDocument"] = "documents.add_user";
  NotificationEventType["AddUserToCollection"] = "collections.add_user";
  NotificationEventType["CreateRevision"] = "revisions.create";
  NotificationEventType["CreateCollection"] = "collections.create";
  NotificationEventType["CreateComment"] = "comments.create";
  NotificationEventType["ResolveComment"] = "comments.resolve";
  NotificationEventType["MentionedInDocument"] = "documents.mentioned";
  NotificationEventType["MentionedInComment"] = "comments.mentioned";
  NotificationEventType["InviteAccepted"] = "emails.invite_accepted";
  NotificationEventType["Onboarding"] = "emails.onboarding";
  NotificationEventType["Features"] = "emails.features";
  NotificationEventType["ExportCompleted"] = "emails.export_completed";
  return NotificationEventType;
}({});
let NotificationChannelType = exports.NotificationChannelType = /*#__PURE__*/function (NotificationChannelType) {
  NotificationChannelType["App"] = "app";
  NotificationChannelType["Email"] = "email";
  NotificationChannelType["Chat"] = "chat";
  return NotificationChannelType;
}({});
const NotificationEventDefaults = exports.NotificationEventDefaults = {
  [NotificationEventType.PublishDocument]: false,
  [NotificationEventType.UpdateDocument]: true,
  [NotificationEventType.CreateCollection]: false,
  [NotificationEventType.CreateComment]: true,
  [NotificationEventType.ResolveComment]: true,
  [NotificationEventType.CreateRevision]: false,
  [NotificationEventType.MentionedInDocument]: true,
  [NotificationEventType.MentionedInComment]: true,
  [NotificationEventType.InviteAccepted]: true,
  [NotificationEventType.Onboarding]: true,
  [NotificationEventType.Features]: true,
  [NotificationEventType.ExportCompleted]: true,
  [NotificationEventType.AddUserToDocument]: true,
  [NotificationEventType.AddUserToCollection]: true
};
let UnfurlResourceType = exports.UnfurlResourceType = /*#__PURE__*/function (UnfurlResourceType) {
  UnfurlResourceType["OEmbed"] = "oembed";
  UnfurlResourceType["Mention"] = "mention";
  UnfurlResourceType["Document"] = "document";
  UnfurlResourceType["Issue"] = "issue";
  UnfurlResourceType["PR"] = "pull";
  return UnfurlResourceType;
}({});
let QueryNotices = exports.QueryNotices = /*#__PURE__*/function (QueryNotices) {
  QueryNotices["UnsubscribeDocument"] = "unsubscribe-document";
  return QueryNotices;
}({});
let IconType = exports.IconType = /*#__PURE__*/function (IconType) {
  IconType["SVG"] = "svg";
  IconType["Emoji"] = "emoji";
  return IconType;
}({});
let EmojiCategory = exports.EmojiCategory = /*#__PURE__*/function (EmojiCategory) {
  EmojiCategory["People"] = "People";
  EmojiCategory["Nature"] = "Nature";
  EmojiCategory["Foods"] = "Foods";
  EmojiCategory["Activity"] = "Activity";
  EmojiCategory["Places"] = "Places";
  EmojiCategory["Objects"] = "Objects";
  EmojiCategory["Symbols"] = "Symbols";
  EmojiCategory["Flags"] = "Flags";
  return EmojiCategory;
}({});
let EmojiSkinTone = exports.EmojiSkinTone = /*#__PURE__*/function (EmojiSkinTone) {
  EmojiSkinTone["Default"] = "Default";
  EmojiSkinTone["Light"] = "Light";
  EmojiSkinTone["MediumLight"] = "MediumLight";
  EmojiSkinTone["Medium"] = "Medium";
  EmojiSkinTone["MediumDark"] = "MediumDark";
  EmojiSkinTone["Dark"] = "Dark";
  return EmojiSkinTone;
}({});