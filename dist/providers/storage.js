"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.photoBucketName = exports.storage = void 0;
const storage_1 = require("@google-cloud/storage");
const config_1 = require("../config");
exports.storage = new storage_1.Storage();
exports.photoBucketName = config_1.PHOTO_BUCKET;
