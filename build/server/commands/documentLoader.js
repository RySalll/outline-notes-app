"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadDocument;
var _invariant = _interopRequireDefault(require("invariant"));
var _sequelize = require("sequelize");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _UrlHelper = require("./../../shared/utils/UrlHelper");
var _errors = require("./../errors");
var _models = require("./../models");
var _policies = require("./../policies");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function loadDocument(_ref) {
  let {
    id,
    shareId,
    teamId,
    user,
    includeState
  } = _ref;
  let document;
  let collection;
  let share;
  if (!shareId && !(id && user)) {
    throw (0, _errors.AuthenticationError)(`Authentication or shareId required`);
  }
  const shareUrlId = shareId && !(0, _isUUID.default)(shareId) && _UrlHelper.UrlHelper.SHARE_URL_SLUG_REGEX.test(shareId) ? shareId : undefined;
  if (shareUrlId && !teamId) {
    throw (0, _errors.InvalidRequestError)("teamId required for fetching share using shareUrlId");
  }
  if (shareId) {
    let whereClause = {
      revokedAt: {
        [_sequelize.Op.is]: null
      },
      id: shareId
    };
    if (shareUrlId) {
      whereClause = {
        revokedAt: {
          [_sequelize.Op.is]: null
        },
        teamId,
        urlId: shareUrlId
      };
    }
    share = await _models.Share.findOne({
      where: whereClause,
      include: [{
        // unscoping here allows us to return unpublished documents
        model: _models.Document.unscoped(),
        include: [{
          model: _models.User,
          as: "createdBy",
          paranoid: false
        }, {
          model: _models.User,
          as: "updatedBy",
          paranoid: false
        }],
        required: true,
        as: "document"
      }]
    });
    if (!share || share.document?.archivedAt) {
      throw (0, _errors.InvalidRequestError)("Document could not be found for shareId");
    }

    // It is possible to pass both an id and a shareId to the documents.info
    // endpoint. In this case we'll load the document based on the `id` and check
    // if the provided share token allows access. This is used by the frontend
    // to navigate nested documents from a single share link.
    if (id) {
      document = await _models.Document.findByPk(id, {
        userId: user ? user.id : undefined,
        paranoid: false
      }); // otherwise, if the user has an authenticated session make sure to load
      // with their details so that we can return the correct policies, they may
      // be able to edit the shared document
    } else if (user) {
      document = await _models.Document.findByPk(share.documentId, {
        userId: user.id,
        paranoid: false
      });
    } else {
      document = share.document;
    }
    if (!document) {
      throw (0, _errors.NotFoundError)("Document could not be found for shareId");
    }
    if (document.isTrialImport) {
      throw (0, _errors.PaymentRequiredError)();
    }

    // If the user has access to read the document, we can just update
    // the last access date and return the document without additional checks.
    const canReadDocument = user && (0, _policies.can)(user, "read", document);
    if (canReadDocument) {
      // Cannot use document.collection here as it does not include the
      // documentStructure by default through the relationship.
      if (document.collectionId) {
        collection = await _models.Collection.findByPk(document.collectionId);
        if (!collection) {
          throw (0, _errors.NotFoundError)("Collection could not be found for document");
        }
      }
      return {
        document,
        share,
        collection
      };
    }

    // "published" === on the public internet.
    // We already know that there's either no logged in user or the user doesn't
    // have permission to read the document, so we can throw an error.
    if (!share.published) {
      throw (0, _errors.AuthorizationError)();
    }

    // It is possible to disable sharing at the collection so we must check
    if (document.collectionId) {
      collection = await _models.Collection.findByPk(document.collectionId);
    }
    (0, _invariant.default)(collection, "collection not found");
    if (!collection.sharing) {
      throw (0, _errors.AuthorizationError)();
    }

    // If we're attempting to load a document that isn't the document originally
    // shared then includeChildDocuments must be enabled and the document must
    // still be active and nested within the shared document
    if (share.documentId !== document.id) {
      if (!share.includeChildDocuments) {
        throw (0, _errors.AuthorizationError)();
      }

      // If the document is not a direct child of the shared document then we
      // need to check if it is nested within the shared document somewhere.
      if (document.parentDocumentId !== share.documentId) {
        const childDocumentIds = (await share.document?.findAllChildDocumentIds({
          archivedAt: {
            [_sequelize.Op.is]: null
          }
        })) ?? [];
        if (!childDocumentIds.includes(document.id)) {
          throw (0, _errors.AuthorizationError)();
        }
      }
    }

    // It is possible to disable sharing at the team level so we must check
    const team = await _models.Team.findByPk(document.teamId, {
      rejectOnEmpty: true
    });
    if (team.suspendedAt) {
      throw (0, _errors.NotFoundError)();
    }
    if (!team.sharing) {
      throw (0, _errors.AuthorizationError)();
    }
  } else {
    document = await _models.Document.findByPk(id, {
      userId: user ? user.id : undefined,
      paranoid: false,
      includeState
    });
    if (!document) {
      throw (0, _errors.NotFoundError)();
    }
    if (document.deletedAt) {
      // don't send data if user cannot restore deleted doc
      user && (0, _policies.authorize)(user, "restore", document);
    } else {
      user && (0, _policies.authorize)(user, "read", document);
    }
    if (document.isTrialImport) {
      throw (0, _errors.PaymentRequiredError)();
    }
    collection = document.collection;
  }
  return {
    document,
    share,
    collection
  };
}