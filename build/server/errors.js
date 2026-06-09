"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdminRequiredError = AdminRequiredError;
exports.AuthenticationError = AuthenticationError;
exports.AuthenticationProviderDisabledError = AuthenticationProviderDisabledError;
exports.AuthorizationError = AuthorizationError;
exports.ClientClosedRequestError = ClientClosedRequestError;
exports.DomainNotAllowedError = DomainNotAllowedError;
exports.EditorUpdateError = EditorUpdateError;
exports.EmailAuthenticationRequiredError = EmailAuthenticationRequiredError;
exports.FileImportError = FileImportError;
exports.GmailAccountCreationError = GmailAccountCreationError;
exports.IncorrectEditionError = IncorrectEditionError;
exports.InternalError = InternalError;
exports.InvalidAuthenticationError = InvalidAuthenticationError;
exports.InvalidRequestError = InvalidRequestError;
exports.InviteRequiredError = InviteRequiredError;
exports.MicrosoftGraphError = MicrosoftGraphError;
exports.NotFoundError = NotFoundError;
exports.OAuthStateMismatchError = OAuthStateMismatchError;
exports.OIDCMalformedUserInfoError = OIDCMalformedUserInfoError;
exports.ParamRequiredError = ParamRequiredError;
exports.PaymentRequiredError = PaymentRequiredError;
exports.RateLimitExceededError = RateLimitExceededError;
exports.TeamDomainRequiredError = TeamDomainRequiredError;
exports.TeamPendingDeletionError = TeamPendingDeletionError;
exports.UserSuspendedError = UserSuspendedError;
exports.ValidationError = ValidationError;
var _httpErrors = _interopRequireDefault(require("http-errors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function InternalError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Internal error";
  return (0, _httpErrors.default)(500, message, {
    id: "internal_error"
  });
}
function AuthenticationError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Authentication required";
  let redirectPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "/";
  return (0, _httpErrors.default)(401, message, {
    redirectPath,
    id: "authentication_required"
  });
}
function InvalidAuthenticationError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Invalid authentication";
  let redirectPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "/";
  return (0, _httpErrors.default)(401, message, {
    redirectPath,
    id: "invalid_authentication"
  });
}
function AuthorizationError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Authorization error";
  return (0, _httpErrors.default)(403, message, {
    id: "authorization_error"
  });
}
function RateLimitExceededError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Rate limit exceeded for this operation";
  return (0, _httpErrors.default)(429, message, {
    id: "rate_limit_exceeded"
  });
}
function InviteRequiredError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "You need an invite to join this team";
  return (0, _httpErrors.default)(403, message, {
    id: "invite_required"
  });
}
function DomainNotAllowedError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "The domain is not allowed for this workspace";
  return (0, _httpErrors.default)(403, message, {
    id: "domain_not_allowed"
  });
}
function AdminRequiredError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "An admin role is required to access this resource";
  return (0, _httpErrors.default)(403, message, {
    id: "admin_required"
  });
}
function UserSuspendedError(_ref) {
  let {
    adminEmail
  } = _ref;
  return (0, _httpErrors.default)(403, "Your access has been suspended by a workspace admin", {
    id: "user_suspended",
    errorData: {
      adminEmail
    }
  });
}
function InvalidRequestError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Request invalid";
  return (0, _httpErrors.default)(400, message, {
    id: "invalid_request"
  });
}
function PaymentRequiredError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Payment required";
  return (0, _httpErrors.default)(402, message, {
    id: "payment_required"
  });
}
function NotFoundError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Resource not found";
  return (0, _httpErrors.default)(404, message, {
    id: "not_found"
  });
}
function ParamRequiredError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Required parameter missing";
  return (0, _httpErrors.default)(400, message, {
    id: "param_required"
  });
}
function ValidationError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Validation failed";
  return (0, _httpErrors.default)(400, message, {
    id: "validation_error"
  });
}
function IncorrectEditionError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Functionality not available in this edition";
  return (0, _httpErrors.default)(402, message, {
    id: "incorrect_edition"
  });
}
function EditorUpdateError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "The client editor is out of date and must be reloaded";
  return (0, _httpErrors.default)(400, message, {
    id: "editor_update_required"
  });
}
function FileImportError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "The file could not be imported";
  return (0, _httpErrors.default)(400, message, {
    id: "import_error"
  });
}
function OAuthStateMismatchError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "State returned in OAuth flow did not match";
  return (0, _httpErrors.default)(400, message, {
    id: "state_mismatch"
  });
}
function TeamPendingDeletionError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "The workspace is pending deletion";
  return (0, _httpErrors.default)(403, message, {
    id: "pending_deletion"
  });
}
function EmailAuthenticationRequiredError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "User must authenticate with email";
  let redirectPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "/";
  return (0, _httpErrors.default)(400, message, {
    redirectPath,
    id: "email_auth_required"
  });
}
function MicrosoftGraphError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Microsoft Graph API did not return required fields";
  return (0, _httpErrors.default)(400, message, {
    id: "graph_error"
  });
}
function TeamDomainRequiredError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Unable to determine workspace from current domain or subdomain";
  return (0, _httpErrors.default)(400, message, {
    id: "domain_required"
  });
}
function GmailAccountCreationError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Cannot create account using personal gmail address";
  return (0, _httpErrors.default)(400, message, {
    id: "gmail_account_creation"
  });
}
function OIDCMalformedUserInfoError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "User profile information malformed";
  return (0, _httpErrors.default)(400, message, {
    id: "malformed_user_info"
  });
}
function AuthenticationProviderDisabledError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Authentication method has been disabled by an admin";
  let redirectPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "/";
  return (0, _httpErrors.default)(400, message, {
    redirectPath,
    id: "authentication_provider_disabled"
  });
}
function ClientClosedRequestError() {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Client closed request before response was received";
  return (0, _httpErrors.default)(499, message, {
    id: "client_closed_request"
  });
}