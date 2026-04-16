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
const photo_service_1 = require("./photo.service");
const firebase_auth_service_1 = require("./firebase-auth.service");
const validators_1 = require("../utils/validators");
function now() {
    return new Date().toISOString();
}
function buildHistoryEntry(user) {
    const { history, passwordHash, firebaseUid, ...snapshot } = user;
    return {
        timestamp: now(),
        data: snapshot,
    };
}
function createApprovalRequest(type, requester, responsibleEmail) {
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
    (0, email_1.sendApprovalRequestEmail)(type, responsibleEmail, requester);
    return approval;
}
function sanitizeUser(user) {
    const { passwordHash, firebaseUid, ...publicUser } = user;
    return publicUser;
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
        graduation: payload.graduation,
        photo: undefined,
        email,
        phone: payload.phone.trim(),
        roles: payload.roles,
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
        user.photo = await (0, photo_service_1.uploadPhoto)(payload.photoBase64, user.id);
    }
    if (payload.password) {
        const firebaseUser = await (0, firebase_auth_service_1.createFirebaseUserAccount)(email, payload.password, user.fullName);
        user.firebaseUid = firebaseUser.uid;
    }
    const savedUser = await (0, user_repository_1.saveUser)(user);
    const approvals = [];
    if (savedUser.responsibleLegalEmail) {
        const approval = createApprovalRequest("legal", savedUser, savedUser.responsibleLegalEmail);
        approvals.push(await (0, approval_repository_1.saveApproval)(approval));
    }
    if (savedUser.technicalResponsibleEmail) {
        const approval = createApprovalRequest("technical", savedUser, savedUser.technicalResponsibleEmail);
        approvals.push(await (0, approval_repository_1.saveApproval)(approval));
    }
    return { user: savedUser, approvals };
}
async function updateUser(id, payload) {
    const existing = await (0, user_repository_1.getUserById)(id);
    if (!existing || existing.deletedAt) {
        throw { status: 404, message: "Usuário não encontrado" };
    }
    const users = await (0, user_repository_1.listUsers)();
    const errors = (0, validators_1.validateUserPayload)(payload, users, existing.id, false);
    if (errors.length > 0) {
        throw { status: 400, errors };
    }
    existing.history.push(buildHistoryEntry(existing));
    const oldLegal = existing.responsibleLegalEmail;
    const oldTechnical = existing.technicalResponsibleEmail;
    existing.fullName = payload.fullName.trim();
    existing.birthDate = payload.birthDate;
    existing.weight = payload.weight;
    existing.graduation = payload.graduation;
    const newEmail = payload.email.trim().toLowerCase();
    const emailChanged = existing.email !== newEmail;
    existing.email = newEmail;
    existing.phone = payload.phone.trim();
    existing.roles = payload.roles;
    existing.responsibleLegalEmail = payload.responsibleLegalEmail?.trim().toLowerCase();
    existing.technicalResponsibleEmail = payload.technicalResponsibleEmail?.trim().toLowerCase();
    existing.updatedAt = now();
    if (payload.photoBase64) {
        existing.photo = await (0, photo_service_1.uploadPhoto)(payload.photoBase64, existing.id);
    }
    if (existing.firebaseUid) {
        const updates = {};
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
            await (0, firebase_auth_service_1.updateFirebaseUserAccount)(existing.firebaseUid, updates);
        }
    }
    else if (payload.password) {
        const firebaseUser = await (0, firebase_auth_service_1.createFirebaseUserAccount)(existing.email, payload.password, existing.fullName);
        existing.firebaseUid = firebaseUser.uid;
    }
    const savedUser = await (0, user_repository_1.saveUser)(existing);
    const approvals = [];
    if (savedUser.responsibleLegalEmail && savedUser.responsibleLegalEmail !== oldLegal) {
        const approval = createApprovalRequest("legal", savedUser, savedUser.responsibleLegalEmail);
        approvals.push(await (0, approval_repository_1.saveApproval)(approval));
    }
    if (savedUser.technicalResponsibleEmail && savedUser.technicalResponsibleEmail !== oldTechnical) {
        const approval = createApprovalRequest("technical", savedUser, savedUser.technicalResponsibleEmail);
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
