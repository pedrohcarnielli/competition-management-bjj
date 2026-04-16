"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebaseConfig = {
    credential: firebase_admin_1.default.credential.applicationDefault(),
};
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp(firebaseConfig);
}
exports.firebaseAuth = firebase_admin_1.default.auth();
