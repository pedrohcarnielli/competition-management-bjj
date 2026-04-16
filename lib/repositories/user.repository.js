"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = saveUser;
exports.getUserById = getUserById;
exports.listUsers = listUsers;
exports.findUserByEmail = findUserByEmail;
exports.findUserByEmailExcludingId = findUserByEmailExcludingId;
const firebase_1 = require("../providers/firebase");
const COLLECTION = "users";
function mapDocument(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        fullName: data?.fullName,
        birthDate: data?.birthDate,
        weight: data?.weight,
        graduation: data?.graduation,
        photo: data?.photo,
        email: data?.email,
        phone: data?.phone,
        roles: data?.roles || [],
        responsibleLegalEmail: data?.responsibleLegalEmail,
        technicalResponsibleEmail: data?.technicalResponsibleEmail,
        passwordHash: data?.passwordHash,
        firebaseUid: data?.firebaseUid,
        deletedAt: data?.deletedAt || null,
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
        history: data?.history || [],
    };
}
async function saveUser(user) {
    const docRef = firebase_1.firestore.collection(COLLECTION).doc(user.id);
    await docRef.set(user);
    return user;
}
async function getUserById(id) {
    const doc = await firebase_1.firestore.collection(COLLECTION).doc(id).get();
    return doc.exists ? mapDocument(doc) : null;
}
async function listUsers() {
    const snapshot = await firebase_1.firestore.collection(COLLECTION).where("deletedAt", "==", null).get();
    return snapshot.docs.map(mapDocument);
}
async function findUserByEmail(email) {
    const snapshot = await firebase_1.firestore.collection(COLLECTION).where("email", "==", email.toLowerCase()).limit(1).get();
    const doc = snapshot.docs[0];
    return doc ? mapDocument(doc) : null;
}
async function findUserByEmailExcludingId(email, excludeId) {
    let query = firebase_1.firestore.collection(COLLECTION).where("email", "==", email.toLowerCase());
    if (excludeId) {
        query = query.where("__name__", "!=", firebase_1.firestore.collection(COLLECTION).doc(excludeId));
    }
    const snapshot = await query.limit(1).get();
    const doc = snapshot.docs[0];
    return doc ? mapDocument(doc) : null;
}
