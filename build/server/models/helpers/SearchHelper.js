"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _invariant = _interopRequireDefault(require("invariant"));
var _escapeRegExp = _interopRequireDefault(require("lodash/escapeRegExp"));
var _find = _interopRequireDefault(require("lodash/find"));
var _map = _interopRequireDefault(require("lodash/map"));
var _pgTsquery = _interopRequireDefault(require("pg-tsquery"));
var _sequelize = require("sequelize");
var _types = require("./../../../shared/types");
var _string = require("./../../../shared/utils/string");
var _urls = require("./../../../shared/utils/urls");
var _errors = require("./../../errors");
var _Collection = _interopRequireDefault(require("./../Collection"));
var _Document = _interopRequireDefault(require("./../Document"));
var _Team = _interopRequireDefault(require("./../Team"));
var _User = _interopRequireDefault(require("./../User"));
var _database = require("./../../storage/database");
var _DocumentHelper = require("./DocumentHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class SearchHelper {
  static async searchForTeam(team) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      limit = 15,
      offset = 0,
      query
    } = options;
    const where = await this.buildWhere(team, {
      ...options,
      statusFilter: [...(options.statusFilter || []), _types.StatusFilter.Published]
    });
    if (options.share?.includeChildDocuments) {
      const sharedDocument = await options.share.$get("document");
      (0, _invariant.default)(sharedDocument, "Cannot find document for share");
      const childDocumentIds = await sharedDocument.findAllChildDocumentIds({
        archivedAt: {
          [_sequelize.Op.is]: null
        }
      });
      where[_sequelize.Op.and].push({
        id: [sharedDocument.id, ...childDocumentIds]
      });
    }
    const findOptions = this.buildFindOptions(query);
    try {
      const resultsQuery = _Document.default.unscoped().findAll({
        ...findOptions,
        where,
        limit,
        offset
      });
      const countQuery = _Document.default.unscoped().count({
        // @ts-expect-error Types are incorrect for count
        replacements: findOptions.replacements,
        where
      });
      const [results, count] = await Promise.all([resultsQuery, countQuery]);

      // Final query to get associated document data
      const documents = await _Document.default.findAll({
        where: {
          id: (0, _map.default)(results, "id"),
          teamId: team.id
        },
        include: [{
          model: _Collection.default,
          as: "collection"
        }]
      });
      return this.buildResponse({
        query,
        results,
        documents,
        count
      });
    } catch (err) {
      if (err.message.includes("syntax error in tsquery")) {
        throw (0, _errors.ValidationError)("Invalid search query");
      }
      throw err;
    }
  }
  static async searchTitlesForUser(user) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      limit = 15,
      offset = 0,
      query,
      ...rest
    } = options;
    const where = await this.buildWhere(user, rest);
    if (query) {
      where[_sequelize.Op.and].push({
        title: {
          [_sequelize.Op.iLike]: `%${query}%`
        }
      });
    }
    const include = [{
      association: "memberships",
      where: {
        userId: user.id
      },
      required: false,
      separate: false
    }, {
      model: _User.default,
      as: "createdBy",
      paranoid: false
    }, {
      model: _User.default,
      as: "updatedBy",
      paranoid: false
    }];
    return _Document.default.scope(["withDrafts", {
      method: ["withViews", user.id]
    }, {
      method: ["withCollectionPermissions", user.id]
    }, {
      method: ["withMembership", user.id]
    }]).findAll({
      where,
      subQuery: false,
      order: [["updatedAt", "DESC"]],
      include,
      offset,
      limit
    });
  }
  static async searchForUser(user) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      limit = 15,
      offset = 0,
      query
    } = options;
    const where = await this.buildWhere(user, options);
    const findOptions = this.buildFindOptions(query);
    const include = [{
      association: "memberships",
      where: {
        userId: user.id
      },
      required: false,
      separate: false
    }];
    try {
      const results = await _Document.default.unscoped().findAll({
        ...findOptions,
        subQuery: false,
        include,
        where,
        limit,
        offset
      });
      const countQuery = _Document.default.unscoped().count({
        // @ts-expect-error Types are incorrect for count
        subQuery: false,
        include,
        replacements: findOptions.replacements,
        where
      });

      // Final query to get associated document data
      const [documents, count] = await Promise.all([_Document.default.scope(["withDrafts", {
        method: ["withViews", user.id]
      }, {
        method: ["withCollectionPermissions", user.id]
      }, {
        method: ["withMembership", user.id]
      }]).findAll({
        where: {
          teamId: user.teamId,
          id: (0, _map.default)(results, "id")
        }
      }), results.length < limit && offset === 0 ? Promise.resolve(results.length) : countQuery]);
      return this.buildResponse({
        query,
        results,
        documents,
        count
      });
    } catch (err) {
      if (err.message.includes("syntax error in tsquery")) {
        throw (0, _errors.ValidationError)("Invalid search query");
      }
      throw err;
    }
  }
  static buildFindOptions(query) {
    const attributes = ["id"];
    const replacements = {};
    const order = [["updatedAt", "DESC"]];
    if (query) {
      attributes.push([_sequelize.Sequelize.literal(`ts_rank("searchVector", to_tsquery('english', :query))`), "searchRanking"]);
      replacements["query"] = this.webSearchQuery(query);
      order.unshift(["searchRanking", "DESC"]);
    }
    return {
      attributes,
      replacements,
      order
    };
  }
  static buildResultContext(document, query) {
    const quotedQueries = Array.from(query.matchAll(/"([^"]*)"/g));
    const text = _DocumentHelper.DocumentHelper.toPlainText(document);

    // Regex to highlight quoted queries as ts_headline will not do this by default due to stemming.
    const fullMatchRegex = new RegExp((0, _escapeRegExp.default)(query), "i");
    const highlightRegex = new RegExp([fullMatchRegex.source, ...(quotedQueries.length ? quotedQueries.map(match => (0, _escapeRegExp.default)(match[1])) : this.removeStopWords(query).trim().split(" ").map(match => `\\b${(0, _escapeRegExp.default)(match)}\\b`))].join("|"), "gi");

    // Breaking characters
    const breakChars = [" ", ".", ",", `"`, "'", "\n", "。", "！", "？", "!", "?", "…"];
    const breakCharsRegex = new RegExp(`[${breakChars.join("")}]`, "g");

    // chop text around the first match, prefer the first full match if possible.
    const fullMatchIndex = text.search(fullMatchRegex);
    const offsetStartIndex = (fullMatchIndex >= 0 ? fullMatchIndex : text.search(highlightRegex)) - 65;
    const startIndex = Math.max(0, offsetStartIndex <= 0 ? 0 : (0, _string.regexIndexOf)(text, breakCharsRegex, offsetStartIndex));
    const context = text.replace(highlightRegex, "<b>$&</b>");
    const endIndex = (0, _string.regexLastIndexOf)(context, breakCharsRegex, startIndex + 250);
    return context.slice(startIndex, endIndex);
  }
  static async buildWhere(model, options) {
    const teamId = model instanceof _Team.default ? model.id : model.teamId;
    const where = {
      teamId,
      [_sequelize.Op.or]: [],
      [_sequelize.Op.and]: [{
        deletedAt: {
          [_sequelize.Op.eq]: null
        }
      }]
    };
    if (model instanceof _User.default) {
      where[_sequelize.Op.or].push({
        "$memberships.id$": {
          [_sequelize.Op.ne]: null
        }
      });
    }

    // Ensure we're filtering by the users accessible collections. If
    // collectionId is passed as an option it is assumed that the authorization
    // has already been done in the router
    const collectionIds = options.collectionId ? [options.collectionId] : await model.collectionIds();
    if (collectionIds.length) {
      where[_sequelize.Op.or].push({
        collectionId: collectionIds
      });
    }
    if (options.dateFilter) {
      where[_sequelize.Op.and].push({
        updatedAt: {
          [_sequelize.Op.gt]: _database.sequelize.literal(`now() - interval '1 ${options.dateFilter}'`)
        }
      });
    }
    if (options.collaboratorIds) {
      where[_sequelize.Op.and].push({
        collaboratorIds: {
          [_sequelize.Op.contains]: options.collaboratorIds
        }
      });
    }
    if (options.documentIds) {
      where[_sequelize.Op.and].push({
        id: options.documentIds
      });
    }
    const statusQuery = [];
    if (options.statusFilter?.includes(_types.StatusFilter.Published)) {
      statusQuery.push({
        [_sequelize.Op.and]: [{
          publishedAt: {
            [_sequelize.Op.ne]: null
          },
          archivedAt: {
            [_sequelize.Op.eq]: null
          }
        }]
      });
    }
    if (options.statusFilter?.includes(_types.StatusFilter.Draft) &&
    // Only ever include draft results for the user's own documents
    model instanceof _User.default) {
      statusQuery.push({
        [_sequelize.Op.and]: [{
          publishedAt: {
            [_sequelize.Op.eq]: null
          },
          archivedAt: {
            [_sequelize.Op.eq]: null
          },
          [_sequelize.Op.or]: [{
            createdById: model.id
          }, {
            "$memberships.id$": {
              [_sequelize.Op.ne]: null
            }
          }]
        }]
      });
    }
    if (options.statusFilter?.includes(_types.StatusFilter.Archived)) {
      statusQuery.push({
        archivedAt: {
          [_sequelize.Op.ne]: null
        }
      });
    }
    if (statusQuery.length) {
      where[_sequelize.Op.and].push({
        [_sequelize.Op.or]: statusQuery
      });
    }
    if (options.query) {
      // find words that look like urls, these should be treated separately as the postgres full-text
      // index will generally not match them.
      const likelyUrls = (0, _urls.getUrls)(options.query);

      // remove likely urls, and escape the rest of the query.
      let limitedQuery = this.escapeQuery(likelyUrls.reduce((q, url) => q.replace(url, ""), options.query).slice(0, this.maxQueryLength).trim());

      // Extract quoted queries and add them to the where clause, up to a maximum of 3 total.
      const quotedQueries = Array.from(limitedQuery.matchAll(/"([^"]*)"/g)).map(match => match[1]);

      // remove quoted queries from the limited query
      limitedQuery = limitedQuery.replace(/"([^"]*)"/g, "");
      const iLikeQueries = [...quotedQueries, ...likelyUrls].slice(0, 3);
      for (const match of iLikeQueries) {
        where[_sequelize.Op.and].push({
          [_sequelize.Op.or]: [{
            title: {
              [_sequelize.Op.iLike]: `%${match}%`
            }
          }, {
            text: {
              [_sequelize.Op.iLike]: `%${match}%`
            }
          }]
        });
      }
      if (limitedQuery || iLikeQueries.length === 0) {
        where[_sequelize.Op.and].push(_sequelize.Sequelize.fn(`"searchVector" @@ to_tsquery`, "english", _sequelize.Sequelize.literal(":query")));
      }
    }
    return where;
  }
  static buildResponse(_ref) {
    let {
      query,
      results,
      documents,
      count
    } = _ref;
    return {
      results: (0, _map.default)(results, result => {
        const document = (0, _find.default)(documents, {
          id: result.id
        });
        return {
          ranking: result.dataValues.searchRanking,
          context: query ? this.buildResultContext(document, query) : undefined,
          document
        };
      }),
      total: count
    };
  }

  /**
   * Convert a user search query into a format that can be used by Postgres
   *
   * @param query The user search query
   * @returns The query formatted for Postgres ts_query
   */
  static webSearchQuery(query) {
    // limit length of search queries as we're using regex against untrusted input
    let limitedQuery = this.escapeQuery(query.slice(0, this.maxQueryLength));
    const quotedSearch = limitedQuery.startsWith('"') && limitedQuery.endsWith('"');

    // Replace single quote characters with &.
    const singleQuotes = limitedQuery.matchAll(/'+/g);
    for (const match of singleQuotes) {
      if (match.index && match.index > 0 && match.index < limitedQuery.length - 1) {
        limitedQuery = limitedQuery.substring(0, match.index) + "&" + limitedQuery.substring(match.index + 1);
      }
    }
    return (0, _pgTsquery.default)()(
    // Although queryParser trims the query, looks like there's a
    // bug for certain cases where it removes other characters in addition to
    // spaces. Ref: https://github.com/caub/pg-tsquery/issues/27
    quotedSearch ? limitedQuery.trim() : `${limitedQuery.trim()}*`)
    // Remove any trailing join characters
    .replace(/&$/, "")
    // Remove any trailing escape characters
    .replace(/\\$/, "");
  }
  static escapeQuery(query) {
    return query
    // replace "\" with escaped "\\" because sequelize.escape doesn't do it
    // see: https://github.com/sequelize/sequelize/issues/2950
    .replace(/\\/g, "\\\\")
    // replace ":" with escaped "\:" because it's a reserved character in tsquery
    // see: https://github.com/outline/outline/issues/6542
    .replace(/:/g, "\\:");
  }
  static removeStopWords(query) {
    const stopwords = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];
    return query.split(" ").filter(word => !stopwords.includes(word)).join(" ");
  }
}
exports.default = SearchHelper;
/**
 * The maximum length of a search query.
 */
_defineProperty(SearchHelper, "maxQueryLength", 1000);