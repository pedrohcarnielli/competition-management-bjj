import admin from "firebase-admin";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const adminConfig = {
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.FB_STORAGE_BUCKET,
};

if (!admin.apps.length) {
  admin.initializeApp(adminConfig);
}

// Initialize Firebase Web SDK for authentication (email/password login)
const webConfig = {
  apiKey: process.env.FB_WEB_API_KEY,
  projectId: process.env.FB_PROJECT_ID || "competition-management-bjj",
  authDomain: process.env.FB_AUTH_DOMAIN || "competition-management-bjj.firebaseapp.com",
};

let authInstance: Auth | null = null;

function initializeWebAuth(): Auth {
  if (!authInstance) {
    if (!getApps().find(app => app.name === "web")) {
      const app = initializeApp(webConfig, "web");
      authInstance = getAuth(app);
    } else {
      authInstance = getAuth(getApps().find(app => app.name === "web"));
    }
  }
  return authInstance;
}

export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();
export const webAuth = initializeWebAuth();
