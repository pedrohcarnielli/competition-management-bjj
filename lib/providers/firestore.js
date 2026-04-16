"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const firebase_admin_1 = require("firebase-admin");
exports.db = (0, firebase_admin_1.firestore)();
