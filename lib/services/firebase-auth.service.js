"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseUserAccount = createFirebaseUserAccount;
exports.updateFirebaseUserAccount = updateFirebaseUserAccount;
exports.deleteFirebaseUserAccount = deleteFirebaseUserAccount;
const firebase_1 = require("../providers/firebase");
async function createFirebaseUserAccount(email, password, displayName) {
    const user = await firebase_1.firebaseAuth.createUser({
        email,
        password,
        displayName,
    });
    return user;
}
async function updateFirebaseUserAccount(firebaseUid, updates) {
    const user = await firebase_1.firebaseAuth.updateUser(firebaseUid, updates);
    return user;
}
async function deleteFirebaseUserAccount(firebaseUid) {
    await firebase_1.firebaseAuth.deleteUser(firebaseUid);
}
