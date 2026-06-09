"use strict";

require("reflect-metadata");
var _env = _interopRequireDefault(require("./../../shared/env"));
var _env2 = _interopRequireDefault(require("./../env"));
var _redis = _interopRequireDefault(require("./../storage/redis"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
require("./../storage/database");
jest.mock("bull");

// This is needed for the relative manual mock to be picked up
jest.mock("../queues");

// We never want to make real S3 requests in test environment
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({
    send: jest.fn()
  })),
  DeleteObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  ObjectCannedACL: {}
}));
jest.mock("@aws-sdk/lib-storage", () => ({
  Upload: jest.fn(() => ({
    done: jest.fn()
  }))
}));
jest.mock("@aws-sdk/s3-presigned-post", () => ({
  createPresignedPost: jest.fn()
}));
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn()
}));
afterAll(() => _redis.default.defaultClient.disconnect());
beforeEach(() => {
  _env2.default.URL = _env.default.URL = "https://app.outline.dev";
});