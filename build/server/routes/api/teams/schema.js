"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TeamsUpdateSchema = exports.TeamsDeleteSchema = void 0;
var _zod = require("zod");
var _types = require("./../../../../shared/types");
var _schema = require("./../schema");
const TeamsUpdateSchema = exports.TeamsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Team name */
    name: _zod.z.string().optional(),
    /** Avatar URL */
    avatarUrl: _zod.z.string().nullish(),
    /** The subdomain to access the team */
    subdomain: _zod.z.string().nullish(),
    /** Whether public sharing is enabled */
    sharing: _zod.z.boolean().optional(),
    /** Whether siginin with email is enabled */
    guestSignin: _zod.z.boolean().optional(),
    /** Whether third-party document embeds are enabled */
    documentEmbeds: _zod.z.boolean().optional(),
    /** Whether team members are able to create new collections */
    memberCollectionCreate: _zod.z.boolean().optional(),
    /** Whether team members are able to create new workspaces */
    memberTeamCreate: _zod.z.boolean().optional(),
    /** The default landing collection for the team */
    defaultCollectionId: _zod.z.string().uuid().nullish(),
    /** The default user role */
    defaultUserRole: _zod.z.nativeEnum(_types.UserRole).optional(),
    /** Whether new users must be invited to join the team */
    inviteRequired: _zod.z.boolean().optional(),
    /** Domains allowed to sign-in with SSO */
    allowedDomains: _zod.z.array(_zod.z.string()).optional(),
    /** Team preferences */
    preferences: _zod.z.object({
      /** Whether documents have a separate edit mode instead of seamless editing. */
      seamlessEdit: _zod.z.boolean().optional(),
      /** Whether to use team logo across the app for branding. */
      publicBranding: _zod.z.boolean().optional(),
      /** Whether viewers should see download options. */
      viewersCanExport: _zod.z.boolean().optional(),
      /** Whether members can invite new people to the team. */
      membersCanInvite: _zod.z.boolean().optional(),
      /** Whether members can create API keys. */
      membersCanCreateApiKey: _zod.z.boolean().optional(),
      /** Whether members can delete their user account. */
      membersCanDeleteAccount: _zod.z.boolean().optional(),
      /** Whether notification emails include document and comment content. */
      previewsInEmails: _zod.z.boolean().optional(),
      /** Whether commenting is enabled */
      commenting: _zod.z.boolean().optional(),
      /** The custom theme for the team. */
      customTheme: _zod.z.object({
        accent: _zod.z.string().min(4).max(7).regex(/^#/).optional(),
        accentText: _zod.z.string().min(4).max(7).regex(/^#/).optional()
      }).optional(),
      /** Side to display the document's table of contents in relation to the main content. */
      tocPosition: _zod.z.nativeEnum(_types.TOCPosition).optional()
    }).optional()
  })
});
const TeamsDeleteSchema = exports.TeamsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    code: _zod.z.string()
  })
});