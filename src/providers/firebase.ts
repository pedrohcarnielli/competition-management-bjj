import admin from "firebase-admin";

const firebaseConfig = {
  credential: admin.credential.applicationDefault(),
};

if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();
