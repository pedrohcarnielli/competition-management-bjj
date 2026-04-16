import { firestore } from "../providers/firebase";
import { User } from "../models";

const COLLECTION = "users";

function mapDocument(doc: FirebaseFirestore.DocumentSnapshot): User {
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

export async function saveUser(user: User): Promise<User> {
    const docRef = firestore.collection(COLLECTION).doc(user.id);
    await docRef.set(user);
    return user;
}

export async function getUserById(id: string): Promise<User | null> {
    const doc = await firestore.collection(COLLECTION).doc(id).get();
    return doc.exists ? mapDocument(doc) : null;
}

export async function listUsers(): Promise<User[]> {
    const snapshot = await firestore.collection(COLLECTION).where("deletedAt", "==", null).get();
    return snapshot.docs.map(mapDocument);
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const snapshot = await firestore.collection(COLLECTION).where("email", "==", email.toLowerCase()).limit(1).get();
    const doc = snapshot.docs[0];
    return doc ? mapDocument(doc) : null;
}

export async function findUserByEmailExcludingId(email: string, excludeId?: string): Promise<User | null> {
    let query = firestore.collection(COLLECTION).where("email", "==", email.toLowerCase());
    if (excludeId) {
        query = query.where("__name__", "!=", firestore.collection(COLLECTION).doc(excludeId));
    }
    const snapshot = await query.limit(1).get();
    const doc = snapshot.docs[0];
    return doc ? mapDocument(doc) : null;
}
