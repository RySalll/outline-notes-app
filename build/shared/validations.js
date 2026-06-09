"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebhookSubscriptionValidation = exports.UserValidation = exports.TeamValidation = exports.PinValidation = exports.DocumentValidation = exports.CommentValidation = exports.CollectionValidation = exports.AttachmentValidation = exports.ApiKeyValidation = void 0;
const AttachmentValidation = exports.AttachmentValidation = {
  /** The limited allowable mime-types for user and team avatars */
  avatarContentTypes: ["image/jpg", "image/jpeg", "image/png"],
  /** Image mime-types commonly supported by modern browsers */
  imageContentTypes: ["image/jpg", "image/jpeg", "image/pjpeg", "image/png", "image/apng", "image/avif", "image/gif", "image/webp", "image/svg", "image/svg+xml", "image/bmp", "image/tiff", "image/heic"]
};
const ApiKeyValidation = exports.ApiKeyValidation = {
  /** The minimum length of the API key name */
  minNameLength: 3,
  /** The maximum length of the API key name */
  maxNameLength: 255
};
const CollectionValidation = exports.CollectionValidation = {
  /** The maximum length of the collection description */
  maxDescriptionLength: 100 * 1000,
  /** The maximum length of the collection name */
  maxNameLength: 100
};
const CommentValidation = exports.CommentValidation = {
  /** The maximum length of a comment */
  maxLength: 1000
};
const DocumentValidation = exports.DocumentValidation = {
  /** The maximum length of the document title */
  maxTitleLength: 100,
  /** The maximum length of the document summary */
  maxSummaryLength: 1000,
  /** The maximum size of the collaborative document state */
  maxStateLength: 1500 * 1024
};
const PinValidation = exports.PinValidation = {
  /** The maximum number of pinned documents on an individual collection or home screen */
  max: 8
};
const TeamValidation = exports.TeamValidation = {
  /** The maximum number of domains per team on cloud hosted */
  maxDomains: 10
};
const UserValidation = exports.UserValidation = {
  /** The maximum number of invites per request */
  maxInvitesPerRequest: 20
};
const WebhookSubscriptionValidation = exports.WebhookSubscriptionValidation = {
  /** The maximum number of webhooks per team */
  maxSubscriptions: 10
};