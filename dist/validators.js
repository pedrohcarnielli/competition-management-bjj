"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adultGraduations = exports.minorGraduations = exports.roles = void 0;
exports.calculateAge = calculateAge;
exports.getAllowedGraduations = getAllowedGraduations;
exports.validateUserPayload = validateUserPayload;
exports.roles = ["Aluno", "responsável legal", "responsável técnico", "adm"];
exports.minorGraduations = [
    "branca",
    "cinza com branco",
    "cinza",
    "cinza com preto",
    "amarela com branco",
    "amarela",
    "amarela com preto",
    "laranja com branco",
    "laranja",
    "laranja com preto",
    "verde com branco",
    "verde",
    "verde com preto"
];
exports.adultGraduations = [
    "branca",
    "azul",
    "roxa",
    "marrom",
    "preta"
];
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }
    return age;
}
function getAllowedGraduations(age) {
    return age < 16 ? exports.minorGraduations : exports.adultGraduations;
}
function validateUserPayload(payload, existingUsers, currentUserId) {
    const errors = [];
    const requiredFields = ["fullName", "birthDate", "weight", "graduation", "email", "phone", "roles"];
    for (const field of requiredFields) {
        if (payload[field] === undefined || payload[field] === null) {
            errors.push(`Campo obrigatório ausente: ${field}`);
        }
    }
    if (payload.birthDate) {
        const birth = new Date(payload.birthDate);
        if (Number.isNaN(birth.getTime())) {
            errors.push("birthDate deve estar em formato válido YYYY-MM-DD");
        }
    }
    if (payload.roles) {
        const invalidRoles = payload.roles.filter((role) => !exports.roles.includes(role));
        if (invalidRoles.length > 0) {
            errors.push(`Roles inválidas: ${invalidRoles.join(", ")}`);
        }
        const uniqueRoles = Array.from(new Set(payload.roles));
        if (uniqueRoles.length !== payload.roles.length) {
            errors.push("Roles não podem ser duplicadas");
        }
    }
    if (payload.weight !== undefined && (typeof payload.weight !== "number" || payload.weight <= 0)) {
        errors.push("weight deve ser um número positivo");
    }
    if (payload.email) {
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(payload.email)) {
            errors.push("email inválido");
        }
    }
    if (payload.birthDate && payload.graduation) {
        const age = calculateAge(payload.birthDate);
        const allowed = getAllowedGraduations(age);
        if (!allowed.includes(payload.graduation)) {
            errors.push(`Graduação inválida para idade ${age}: ${payload.graduation}. Opções válidas: ${allowed.join(", ")}`);
        }
    }
    const hasAluno = payload.roles?.includes("Aluno");
    let age = undefined;
    if (payload.birthDate) {
        age = calculateAge(payload.birthDate);
    }
    if (hasAluno) {
        if (!payload.technicalResponsibleEmail) {
            errors.push("Aluno exige technicalResponsibleEmail de um responsável técnico");
        }
        if (age !== undefined && age < 18 && !payload.responsibleLegalEmail) {
            errors.push("Aluno menor de 18 anos exige responsibleLegalEmail de um responsável legal");
        }
    }
    if (payload.responsibleLegalEmail) {
        const responsible = existingUsers.find((user) => user.email === payload.responsibleLegalEmail && user.id !== currentUserId);
        if (!responsible) {
            errors.push("responsibleLegalEmail deve ser um email de usuário existente com role responsável legal");
        }
        else if (!responsible.roles.includes("responsável legal")) {
            errors.push("responsibleLegalEmail deve apontar para um usuário com role responsável legal");
        }
    }
    if (payload.technicalResponsibleEmail) {
        const responsible = existingUsers.find((user) => user.email === payload.technicalResponsibleEmail && user.id !== currentUserId);
        if (!responsible) {
            errors.push("technicalResponsibleEmail deve ser um email de usuário existente com role responsável técnico");
        }
        else if (!responsible.roles.includes("responsável técnico")) {
            errors.push("technicalResponsibleEmail deve apontar para um usuário com role responsável técnico");
        }
    }
    return errors;
}
