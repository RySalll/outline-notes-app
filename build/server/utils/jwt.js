"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDetailsForEmailUpdateToken = getDetailsForEmailUpdateToken;
exports.getJWTPayload = getJWTPayload;
exports.getUserForEmailSigninToken = getUserForEmailSigninToken;
exports.getUserForJWT = getUserForJWT;
var _dateFns = require("date-fns");
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _models = require("./../models");
var _errors = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function getJWTPayload(token) {
  let payload;
  if (!token) {
    throw (0, _errors.AuthenticationError)("Missing token");
  }
  try {
    payload = _jsonwebtoken.default.decode(token);
    if (!payload) {
      throw (0, _errors.AuthenticationError)("Invalid token");
    }
    return payload;
  } catch (err) {
    throw (0, _errors.AuthenticationError)("Unable to decode token");
  }
}
async function getUserForJWT(token) {
  let allowedTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["session", "transfer"];
  const payload = getJWTPayload(token);
  if (!allowedTypes.includes(payload.type)) {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }

  // check the token is within it's expiration time
  if (payload.expiresAt) {
    if (new Date(payload.expiresAt) < new Date()) {
      throw (0, _errors.AuthenticationError)("Expired token");
    }
  }
  const user = await _models.User.findByPk(payload.id, {
    include: [{
      model: _models.Team,
      as: "team",
      required: true
    }]
  });
  if (!user) {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }
  if (payload.type === "transfer") {
    // If the user has made a single API request since the transfer token was
    // created then it's no longer valid, they'll need to sign in again.
    if (user.lastActiveAt && payload.createdAt && user.lastActiveAt > new Date(payload.createdAt)) {
      throw (0, _errors.AuthenticationError)("Token has already been used");
    }
  }
  try {
    _jsonwebtoken.default.verify(token, user.jwtSecret);
  } catch (err) {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }
  return user;
}
async function getUserForEmailSigninToken(token) {
  const payload = getJWTPayload(token);
  if (payload.type !== "email-signin") {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }

  // check the token is within it's expiration time
  if (payload.createdAt) {
    if (new Date(payload.createdAt) < (0, _dateFns.subMinutes)(new Date(), 10)) {
      throw (0, _errors.AuthenticationError)("Expired token");
    }
  }
  const user = await _models.User.scope("withTeam").findByPk(payload.id, {
    rejectOnEmpty: true
  });
  if (user.lastSignedInAt) {
    if (user.lastSignedInAt > new Date(payload.createdAt)) {
      throw (0, _errors.AuthenticationError)("Expired token");
    }
  }
  try {
    _jsonwebtoken.default.verify(token, user.jwtSecret);
  } catch (err) {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }
  return user;
}
async function getDetailsForEmailUpdateToken(token) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const payload = getJWTPayload(token);
  if (payload.type !== "email-update") {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }

  // check the token is within it's expiration time
  if (payload.createdAt) {
    if (new Date(payload.createdAt) < (0, _dateFns.subMinutes)(new Date(), 10)) {
      throw (0, _errors.AuthenticationError)("Expired token");
    }
  }
  const email = payload.email;
  const user = await _models.User.findByPk(payload.id, {
    rejectOnEmpty: true,
    ...options
  });
  try {
    _jsonwebtoken.default.verify(token, user.jwtSecret);
  } catch (err) {
    throw (0, _errors.AuthenticationError)("Invalid token");
  }
  return {
    user,
    email
  };
}