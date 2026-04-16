"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveApproval = saveApproval;
exports.getApprovalById = getApprovalById;
exports.listApprovals = listApprovals;
const firebase_1 = require("../providers/firebase");
const COLLECTION = "approvals";
function mapDocument(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        type: data?.type,
        requesterId: data?.requesterId,
        requesterEmail: data?.requesterEmail,
        responsibleEmail: data?.responsibleEmail,
        status: data?.status,
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
    };
}
async function saveApproval(approval) {
    const docRef = firebase_1.firestore.collection(COLLECTION).doc(approval.id);
    await docRef.set(approval);
    return approval;
}
async function getApprovalById(id) {
    const doc = await firebase_1.firestore.collection(COLLECTION).doc(id).get();
    return doc.exists ? mapDocument(doc) : null;
}
async function listApprovals() {
    const snapshot = await firebase_1.firestore.collection(COLLECTION).get();
    return snapshot.docs.map(mapDocument);
}
