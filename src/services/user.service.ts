import { v4 as uuid } from "uuid";
import { ApprovalRequest, User, UserPayload } from "../models";
import { findUserByEmailExcludingId, findUserByEmail, getUserById, listUsers, saveUser } from "../repositories/user.repository";
import { saveApproval } from "../repositories/approval.repository";
import { sendApprovalRequestEmail } from "../utils/email";
import { createFirebaseUserAccount, deleteFirebaseUserAccount, updateFirebaseUserAccount } from "./firebase-auth.service";
import { validateUserPayload } from "../utils/validators";
import { storage } from "../providers/storage";

function now(): string {
    return new Date().toISOString();
}

function buildHistoryEntry(user: User) {
    const { history, firebaseUid, ...snapshot } = user;
    return {
        timestamp: now(),
        data: snapshot,
    };
}

function createApprovalRequest(type: "legal" | "technical", requester: User, responsibleEmail: string): ApprovalRequest {
    const approval: ApprovalRequest = {
        id: uuid(),
        type,
        requesterId: requester.id,
        requesterEmail: requester.email,
        responsibleEmail,
        status: "pending",
        createdAt: now(),
        updatedAt: now(),
    };

    sendApprovalRequestEmail(type, responsibleEmail, requester);
    return approval;
}

export function sanitizeUser(user: User) {
    const { firebaseUid, ...publicUser } = user;
    return publicUser;
}

async function uploadPhoto(photoBase64: string, userId: string): Promise<string> {
    const bucket = storage.bucket();
    const fileName = `users/${userId}/photos/perfil_${new Date().getTime()}.jpg`;
    const file = bucket.file(fileName);

    const buffer = Buffer.from(photoBase64, 'base64');

    await file.save(buffer, {
        metadata: {
            contentType: 'image/jpeg',
        },
        public: true,
    });

    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

export async function createUser(payload: UserPayload): Promise<{ user: User; approvals: ApprovalRequest[] }> {
    const existingUsers = await listUsers();
    const errors = validateUserPayload(payload, existingUsers, undefined, true);
    if (errors.length > 0) {
        throw { status: 400, errors };
    }

    const email = payload.email!.trim().toLowerCase();
    const user: User = {
        id: uuid(),
        fullName: payload.fullName!.trim(),
        birthDate: payload.birthDate!,
        weight: payload.weight!,
        graduation: payload.graduation!,
        photo: undefined,
        email,
        phone: payload.phone!.trim(),
        documentNumber: payload.documentNumber?.trim(),
        roles: payload.roles!,
        responsibleLegalEmail: payload.responsibleLegalEmail?.trim().toLowerCase(),
        technicalResponsibleEmail: payload.technicalResponsibleEmail?.trim().toLowerCase(),
        firebaseUid: undefined,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
        history: [],
    };

    // TODO: Implement photo upload to Firebase Storage
    if (payload.photoBase64) {
        user.photo = await uploadPhoto(payload.photoBase64, user.id);
    }

    if (payload.password) {
        const firebaseUser = await createFirebaseUserAccount(email, payload.password, user.fullName);
        user.firebaseUid = firebaseUser.uid;
        user.updatedBy = { uid: firebaseUser.uid, email };
    } else {
        // Para criação sem senha, considerar o próprio usuário como ator
        user.updatedBy = { uid: "", email };
    }

    const savedUser = await saveUser(user);
    const approvals: ApprovalRequest[] = [];

    if (savedUser.responsibleLegalEmail) {
        const approval = createApprovalRequest("legal", savedUser, savedUser.responsibleLegalEmail);
        approvals.push(await saveApproval(approval));
    }
    if (savedUser.technicalResponsibleEmail) {
        const approval = createApprovalRequest("technical", savedUser, savedUser.technicalResponsibleEmail);
        approvals.push(await saveApproval(approval));
    }

    return { user: savedUser, approvals };
}

export async function updateUser(
    id: string,
    payload: UserPayload,
    actor: { uid: string; email: string }
): Promise<{ user: User; approvals: ApprovalRequest[] }> {
    const existing = await getUserById(id);
    if (!existing || existing.deletedAt) {
        throw { status: 404, message: "Usuário não encontrado" };
    }

    const users = await listUsers();
    const errors = validateUserPayload(payload, users, existing.id, false, true);
    if (errors.length > 0) {
        throw { status: 400, errors };
    }

    existing.history.push(buildHistoryEntry(existing));

    const oldLegal = existing.responsibleLegalEmail;
    const oldTechnical = existing.technicalResponsibleEmail;

    if (payload.fullName !== undefined) {
        existing.fullName = payload.fullName.trim();
    }
    if (payload.birthDate !== undefined) {
        existing.birthDate = payload.birthDate;
    }
    if (payload.weight !== undefined) {
        existing.weight = payload.weight;
    }
    if (payload.graduation !== undefined) {
        existing.graduation = payload.graduation;
    }
    if (payload.phone !== undefined) {
        existing.phone = payload.phone.trim();
    }
    if (payload.documentNumber !== undefined) {
        existing.documentNumber = payload.documentNumber?.trim();
    }
    if (payload.roles !== undefined) {
        existing.roles = payload.roles;
    }
    if (payload.responsibleLegalEmail !== undefined) {
        existing.responsibleLegalEmail = payload.responsibleLegalEmail?.trim().toLowerCase();
    }
    if (payload.technicalResponsibleEmail !== undefined) {
        existing.technicalResponsibleEmail = payload.technicalResponsibleEmail?.trim().toLowerCase();
    }
    existing.updatedAt = now();
    existing.updatedBy = actor;

    if (payload.photoBase64) {
        // TODO: Implement photo upload to Firebase Storage
        existing.photo = await uploadPhoto(payload.photoBase64, existing.id);
    }

    if (existing.firebaseUid) {
        const updates: { displayName?: string } = {};
        if (payload.fullName !== undefined && existing.fullName) {
            updates.displayName = existing.fullName;
        }

        if (Object.keys(updates).length > 0) {
            await updateFirebaseUserAccount(existing.firebaseUid, updates);
        }
    }

    const savedUser = await saveUser(existing);
    const approvals: ApprovalRequest[] = [];

    if (savedUser.responsibleLegalEmail && savedUser.responsibleLegalEmail !== oldLegal) {
        const approval = createApprovalRequest("legal", savedUser, savedUser.responsibleLegalEmail);
        approvals.push(await saveApproval(approval));
    }
    if (savedUser.technicalResponsibleEmail && savedUser.technicalResponsibleEmail !== oldTechnical) {
        const approval = createApprovalRequest("technical", savedUser, savedUser.technicalResponsibleEmail);
        approvals.push(await saveApproval(approval));
    }

    return { user: savedUser, approvals };
}

export async function getActiveUsers(): Promise<User[]> {
    return listUsers();
}

export async function getUser(id: string): Promise<User | null> {
    return getUserById(id);
}

export async function deleteUser(id: string): Promise<void> {
    const existing = await getUserById(id);
    if (!existing || existing.deletedAt) {
        throw { status: 404, message: "Usuário não encontrado" };
    }

    if (existing.firebaseUid) {
        await deleteFirebaseUserAccount(existing.firebaseUid);
    }

    existing.deletedAt = now();
    existing.updatedAt = existing.deletedAt;
    await saveUser(existing);
}

