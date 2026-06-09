"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSubscriptionsForDocument = void 0;
exports.default = subscriptionCreator;
var _context = require("./../context");
var _models = require("./../models");
var _database = require("./../storage/database");
/**
 * This command creates a subscription of a user to a document.
 *
 * @returns The subscription that was created
 */
async function subscriptionCreator(_ref) {
  let {
    ctx,
    documentId,
    event,
    resubscribe = true
  } = _ref;
  const {
    user
  } = ctx.context.auth;
  const [subscription] = await _models.Subscription.findOrCreateWithCtx(ctx, {
    where: {
      userId: user.id,
      documentId,
      event
    },
    paranoid: false // Previous subscriptions are soft-deleted, we want to know about them here.
  });

  // If the subscription was deleted, then just restore the existing row.
  if (subscription.deletedAt && resubscribe) {
    await subscription.restoreWithCtx(ctx);
  }
  return subscription;
}

/**
 * Create any new subscriptions that might be missing for collaborators in the
 * document on publish and revision creation. This does mean that there is a
 * short period of time where the user is not subscribed after editing until a
 * revision is created.
 *
 * @param document The document to create subscriptions for
 * @param event The event that triggered the subscription creation
 */
const createSubscriptionsForDocument = async (document, event) => {
  await _database.sequelize.transaction(async transaction => {
    const users = await document.collaborators({
      transaction
    });
    for (const user of users) {
      await subscriptionCreator({
        ctx: (0, _context.createContext)({
          user,
          authType: event.authType,
          ip: event.ip,
          transaction
        }),
        documentId: document.id,
        event: "documents.update",
        resubscribe: false
      });
    }
  });
};
exports.createSubscriptionsForDocument = createSubscriptionsForDocument;