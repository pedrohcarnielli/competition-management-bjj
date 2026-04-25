"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = sanitizeUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.getActiveUsers = getActiveUsers;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
const uuid_1 = require("uuid");
const user_repository_1 = require("../repositories/user.repository");
const approval_repository_1 = require("../repositories/approval.repository");
const email_1 = require("../utils/email");
const firebase_auth_service_1 = require("./firebase-auth.service");
const validators_1 = require("../utils/validators");
const storage_1 = require("../providers/storage");
function now() {
    return new Date().toISOString();
}
function normalizeGraduation(value) {
    return value.trim().toLowerCase();
}
function buildHistoryEntry(user) {
    const { history, firebaseUid, ...snapshot } = user;
    return {
        timestamp: now(),
        data: snapshot,
    };
}
async function createApprovalRequest(type, requester, responsibleEmail) {
    const approval = {
        id: (0, uuid_1.v4)(),
        type,
        requesterId: requester.id,
        requesterEmail: requester.email,
        responsibleEmail,
        status: "pending",
        createdAt: now(),
        updatedAt: now(),
    };
    await (0, email_1.sendApprovalRequestEmail)(type, responsibleEmail, requester);
    return approval;
}
function sanitizeUser(user) {
    const { firebaseUid, ...publicUser } = user;
    return publicUser;
}
async function uploadPhoto(photoBase64, userId) {
    const bucket = storage_1.storage.bucket();
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
async function createUser(payload) {
    const existingUsers = await (0, user_repository_1.listUsers)();
    const errors = (0, validators_1.validateUserPayload)(payload, existingUsers, undefined, true);
    if (errors.length > 0) {
        throw { status: 400, errors };
    }
    const email = payload.email.trim().toLowerCase();
    const user = {
        id: (0, uuid_1.v4)(),
        fullName: payload.fullName.trim(),
        birthDate: payload.birthDate,
        weight: payload.weight,
        graduation: normalizeGraduation(payload.graduation),
        photo: undefined,
        email,
        phone: payload.phone.trim(),
        documentNumber: payload.documentNumber?.trim(),
        roles: payload.roles,
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
        const firebaseUser = await (0, firebase_auth_service_1.createFirebaseUserAccount)(email, payload.password, user.fullName);
        user.firebaseUid = firebaseUser.uid;
        user.updatedBy = { uid: firebaseUser.uid, email };
    }
    else {
        // Para criação sem senha, considerar o próprio usuário como ator
        user.updatedBy = { uid: "", email };
    }
    const savedUser = await (0, user_repository_1.saveUser)(user);
    const approvals = [];
    if (savedUser.responsibleLegalEmail) {
        const approval = await createApprovalRequest("legal", savedUser, savedUser.responsibleLegalEmail);
        approvals.push(await (0, approval_repository_1.saveApproval)(approval));
    }
    if (savedUser.technicalResponsibleEmail) {
        const approval = await createApprovalRequest("technical", savedUser, savedUser.technicalResponsibleEmail);
        approvals.push(await (0, approval_repository_1.saveApproval)(approval));
    }
    return { user: savedUser, approvals };
}
async function updateUser(id, payload, actor) {
    const existing = await (0, user_repository_1.getUserById)(id);
    if (!existing || existing.deletedAt) {
        throw { status: 404, message: "Usuário não encontrado" };
    }
    const users = await (0, user_repository_1.listUsers)();
    const errors = (0, validators_1.validateUserPayload)(payload, users, existing.id, false, true);
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
        existing.graduation = normalizeGraduation(payload.graduation);
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
        const updates = {};
        if (payload.fullName !== undefined && existing.fullName) {
            updates.displayName = existing.fullName;
        }
        if (Object.keys(updates).length > 0) {
            await (0, firebase_auth_service_1.updateFirebaseUserAccount)(existing.firebaseUid, updates);
        }
    }
    const savedUser = await (0, user_repository_1.saveUser)(existing);
    const approvals = [];
    if (savedUser.responsibleLegalEmail && savedUser.responsibleLegalEmail !== oldLegal) {
        const approval = await createApprovalRequest("legal", savedUser, savedUser.responsibleLegalEmail);
        approvals.push(await (0, approval_repository_1.saveApproval)(approval));
    }
    if (savedUser.technicalResponsibleEmail && savedUser.technicalResponsibleEmail !== oldTechnical) {
        const approval = await createApprovalRequest("technical", savedUser, savedUser.technicalResponsibleEmail);
        approvals.push(await (0, approval_repository_1.saveApproval)(approval));
    }
    return { user: savedUser, approvals };
}
async function getActiveUsers() {
    return (0, user_repository_1.listUsers)();
}
async function getUser(id) {
    return (0, user_repository_1.getUserById)(id);
}
async function deleteUser(id) {
    const existing = await (0, user_repository_1.getUserById)(id);
    if (!existing || existing.deletedAt) {
        throw { status: 404, message: "Usuário não encontrado" };
    }
    if (existing.firebaseUid) {
        await (0, firebase_auth_service_1.deleteFirebaseUserAccount)(existing.firebaseUid);
    }
    existing.deletedAt = now();
    existing.updatedAt = existing.deletedAt;
    await (0, user_repository_1.saveUser)(existing);
}
