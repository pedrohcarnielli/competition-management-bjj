"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webAuth = exports.firestore = exports.firebaseAuth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const adminConfig = {
    credential: firebase_admin_1.default.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp(adminConfig);
}
// Initialize Firebase Web SDK for authentication (email/password login)
const webConfig = {
    apiKey: process.env.FIREBASE_WEB_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID || "competition-management-bjj",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "competition-management-bjj.firebaseapp.com",
};
let authInstance = null;
function initializeWebAuth() {
    if (!authInstance) {
        if (!(0, app_1.getApps)().find(app => app.name === "web")) {
            const app = (0, app_1.initializeApp)(webConfig, "web");
            authInstance = (0, auth_1.getAuth)(app);
        }
        else {
            authInstance = (0, auth_1.getAuth)((0, app_1.getApps)().find(app => app.name === "web"));
        }
    }
    return authInstance;
}
exports.firebaseAuth = firebase_admin_1.default.auth();
exports.firestore = firebase_admin_1.default.firestore();
exports.webAuth = initializeWebAuth();
