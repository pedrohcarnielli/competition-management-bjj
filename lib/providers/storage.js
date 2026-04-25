"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const storage_1 = require("firebase-admin/storage");
exports.storage = (0, storage_1.getStorage)();
