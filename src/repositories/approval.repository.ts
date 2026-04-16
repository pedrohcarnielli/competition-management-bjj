import { firestore } from "../providers/firebase";
import { ApprovalRequest } from "../models";

const COLLECTION = "approvals";

function mapDocument(doc: FirebaseFirestore.DocumentSnapshot): ApprovalRequest {
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

export async function saveApproval(approval: ApprovalRequest): Promise<ApprovalRequest> {
    const docRef = firestore.collection(COLLECTION).doc(approval.id);
    await docRef.set(approval);
    return approval;
}

export async function getApprovalById(id: string): Promise<ApprovalRequest | null> {
    const doc = await firestore.collection(COLLECTION).doc(id).get();
    return doc.exists ? mapDocument(doc) : null;
}

export async function listApprovals(): Promise<ApprovalRequest[]> {
    const snapshot = await firestore.collection(COLLECTION).get();
    return snapshot.docs.map(mapDocument);
}
