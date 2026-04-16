import { v4 as uuid } from "uuid";
import { ApprovalRequest, User, UserPayload } from "../models";
import { findUserByEmailExcludingId, findUserByEmail, getUserById, listUsers, saveUser } from "../repositories/user.repository";
import { saveApproval } from "../repositories/approval.repository";
import { sendApprovalRequestEmail } from "../utils/email";
import { uploadPhoto } from "./photo.service";
import { createFirebaseUserAccount, deleteFirebaseUserAccount, updateFirebaseUserAccount } from "./firebase-auth.service";
import { validateUserPayload } from "../utils/validators";

function now(): string {
    return new Date().toISOString();
}

function buildHistoryEntry(user: User) {
    const { history, passwordHash, firebaseUid, ...snapshot } = user;
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
    const { passwordHash, firebaseUid, ...publicUser } = user;
    return publicUser;
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
        roles: payload.roles!,
        responsibleLegalEmail: payload.responsibleLegalEmail?.trim().toLowerCase(),
        technicalResponsibleEmail: payload.technicalResponsibleEmail?.trim().toLowerCase(),
        passwordHash: undefined,
        firebaseUid: undefined,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
        history: [],
    };

    if (payload.photoBase64) {
        user.photo = await uploadPhoto(payload.photoBase64, user.id);
    }

    if (payload.password) {
        const firebaseUser = await createFirebaseUserAccount(email, payload.password, user.fullName);
        user.firebaseUid = firebaseUser.uid;
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

export async function updateUser(id: string, payload: UserPayload): Promise<{ user: User; approvals: ApprovalRequest[] }> {
    const existing = await getUserById(id);
    if (!existing || existing.deletedAt) {
        throw { status: 404, message: "Usuário não encontrado" };
    }

    const users = await listUsers();
    const errors = validateUserPayload(payload, users, existing.id, false);
    if (errors.length > 0) {
        throw { status: 400, errors };
    }

    existing.history.push(buildHistoryEntry(existing));

    const oldLegal = existing.responsibleLegalEmail;
    const oldTechnical = existing.technicalResponsibleEmail;

    existing.fullName = payload.fullName!.trim();
    existing.birthDate = payload.birthDate!;
    existing.weight = payload.weight!;
    existing.graduation = payload.graduation!;
    const newEmail = payload.email!.trim().toLowerCase();
    const emailChanged = existing.email !== newEmail;
    existing.email = newEmail;
    existing.phone = payload.phone!.trim();
    existing.roles = payload.roles!;
    existing.responsibleLegalEmail = payload.responsibleLegalEmail?.trim().toLowerCase();
    existing.technicalResponsibleEmail = payload.technicalResponsibleEmail?.trim().toLowerCase();
    existing.updatedAt = now();

    if (payload.photoBase64) {
        existing.photo = await uploadPhoto(payload.photoBase64, existing.id);
    }

    if (existing.firebaseUid) {
        const updates: { email?: string; password?: string; displayName?: string } = {};
        if (emailChanged) {
            updates.email = existing.email;
        }
        if (payload.password) {
            updates.password = payload.password;
        }
        if (existing.fullName) {
            updates.displayName = existing.fullName;
        }

        if (Object.keys(updates).length > 0) {
            await updateFirebaseUserAccount(existing.firebaseUid, updates);
        }
    } else if (payload.password) {
        const firebaseUser = await createFirebaseUserAccount(existing.email, payload.password, existing.fullName);
        existing.firebaseUid = firebaseUser.uid;
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

