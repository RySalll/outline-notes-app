"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userProvisioner;
var _InviteAcceptedEmail = _interopRequireDefault(require("./../emails/templates/InviteAcceptedEmail"));
var _errors = require("./../errors");
var _Logger = _interopRequireDefault(require("./../logging/Logger"));
var _models = require("./../models");
var _database = require("./../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function userProvisioner(_ref) {
  let {
    name,
    email,
    role,
    language,
    avatarUrl,
    teamId,
    authentication,
    ip
  } = _ref;
  const auth = authentication ? await _models.UserAuthentication.findOne({
    where: {
      providerId: "" + authentication.providerId
    },
    include: [{
      model: _models.User,
      as: "user",
      where: {
        teamId
      },
      required: true
    }]
  }) : undefined;

  // Someone has signed in with this authentication before, we just
  // want to update the details instead of creating a new record
  if (auth && authentication) {
    const {
      providerId,
      authenticationProviderId,
      ...rest
    } = authentication;
    const {
      user
    } = auth;

    // We found an authentication record that matches the user id, but it's
    // associated with a different authentication provider, (eg a different
    // hosted google domain). This is possible in Google Auth when moving domains.
    // In the future we may auto-migrate these.
    if (auth.authenticationProviderId !== authenticationProviderId) {
      throw new Error(`User authentication ${providerId} already exists for ${auth.authenticationProviderId}, tried to assign to ${authenticationProviderId}`);
    }
    if (user) {
      await user.update({
        email
      });
      await auth.update(rest);
      return {
        user,
        authentication: auth,
        isNewUser: false
      };
    }

    // We found an authentication record, but the associated user was deleted or
    // otherwise didn't exist. Cleanup the auth record and proceed with creating
    // a new user. See: https://github.com/outline/outline/issues/2022
    await auth.destroy();
  }

  // A `user` record may exist even if there is no existing authentication record.
  // This is either an invite or a user that's external to the team
  const existingUser = await _models.User.scope(["withAuthentications", "withTeam"]).findOne({
    where: {
      // Email from auth providers may be capitalized and we should respect that
      // however any existing invites will always be lowercased.
      email: email.toLowerCase(),
      teamId
    }
  });
  const team = await _models.Team.scope("withDomains").findByPk(teamId, {
    attributes: ["defaultUserRole", "inviteRequired", "id"]
  });

  // We have an existing user, so we need to update it with our
  // new details and count this as a new user creation.
  if (existingUser) {
    // A `user` record might exist in the form of an invite.
    // An invite is a shell user record with no authentication method
    // that's never been active before.
    const isInvite = existingUser.isInvited;
    const auth = await _database.sequelize.transaction(async transaction => {
      if (isInvite) {
        await _models.Event.create({
          name: "users.create",
          actorId: existingUser.id,
          userId: existingUser.id,
          teamId: existingUser.teamId,
          data: {
            name
          },
          ip
        }, {
          transaction
        });
      }

      // Regardless, create a new authentication record
      // against the existing user (user can auth with multiple SSO providers)
      // Update user's name and avatar based on the most recently added provider
      await existingUser.update({
        name,
        avatarUrl,
        lastActiveAt: new Date(),
        lastActiveIp: ip
      }, {
        transaction
      });

      // Only need to associate the authentication with the user if there is one.
      if (!authentication) {
        return null;
      }
      return await existingUser.$create("authentication", authentication, {
        transaction
      });
    });
    if (isInvite) {
      const inviter = await existingUser.$get("invitedBy");
      if (inviter) {
        await new _InviteAcceptedEmail.default({
          to: inviter.email,
          inviterId: inviter.id,
          invitedName: existingUser.name,
          teamUrl: existingUser.team.url
        }).schedule();
      }
    }
    return {
      user: existingUser,
      authentication: auth,
      isNewUser: isInvite
    };
  } else if (!authentication && !team?.allowedDomains.length) {
    // There's no existing invite or user that matches the external auth email
    // and there is no possibility of matching an allowed domain.
    throw (0, _errors.InvalidAuthenticationError)();
  }

  //
  // No auth, no user – this is an entirely new sign in.
  //

  const transaction = await _models.User.sequelize.transaction();
  try {
    // If the team settings are set to require invites, and there's no existing user record,
    // throw an error and fail user creation.
    if (team?.inviteRequired) {
      _Logger.default.info("authentication", "Sign in without invitation", {
        teamId: team.id,
        email
      });
      throw (0, _errors.InviteRequiredError)();
    }

    // If the team settings do not allow this domain,
    // throw an error and fail user creation.
    if (team && !(await team.isDomainAllowed(email))) {
      throw (0, _errors.DomainNotAllowedError)();
    }
    const user = await _models.User.create({
      name,
      email,
      language,
      role: role ?? team?.defaultUserRole,
      teamId,
      avatarUrl,
      authentications: authentication ? [authentication] : []
    }, {
      include: "authentications",
      transaction
    });
    await _models.Event.create({
      name: "users.create",
      actorId: user.id,
      userId: user.id,
      teamId: user.teamId,
      data: {
        name: user.name
      },
      ip
    }, {
      transaction
    });
    await transaction.commit();
    return {
      user,
      authentication: user.authentications[0],
      isNewUser: true
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}