"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserPayload = validateUserPayload;
const graduation_1 = require("../models/graduation");
const role_1 = require("../models/role");
const age_1 = require("./age");
function validateUserPayload(payload, existingUsers, currentUserId, requirePassword = false) {
    const errors = [];
    const requiredFields = ["fullName", "birthDate", "weight", "graduation", "email", "phone", "roles"];
    if (requirePassword) {
        requiredFields.push("password");
    }
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
        const invalidRoles = payload.roles.filter((role) => !role_1.roles.includes(role));
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
    if (payload.password !== undefined) {
        if (typeof payload.password !== "string" || payload.password.trim().length < 6) {
            errors.push("password deve ter pelo menos 6 caracteres");
        }
    }
    if (payload.birthDate && payload.graduation) {
        const age = (0, age_1.calculateAge)(payload.birthDate);
        const allowed = (0, graduation_1.getAllowedGraduations)(age);
        if (!allowed.includes(payload.graduation)) {
            errors.push(`Graduação inválida para idade ${age}: ${payload.graduation}. Opções válidas: ${allowed.join(", ")}`);
        }
    }
    const hasAluno = payload.roles?.includes("Aluno");
    let age = undefined;
    if (payload.birthDate) {
        age = (0, age_1.calculateAge)(payload.birthDate);
    }
    if (hasAluno) {
        if (!payload.technicalResponsibleEmail) {
            errors.push("Aluno exige technicalResponsibleEmail de um responsável técnico");
        }
        if (age !== undefined && age < 18 && !payload.responsibleLegalEmail) {
            errors.push("Aluno menor de 18 anos exige responsibleLegalEmail de um responsável legal");
        }
    }
    if (payload.email) {
        const existingEmailUser = existingUsers.find((user) => user.email === payload.email?.toLowerCase() && user.id !== currentUserId);
        if (existingEmailUser) {
            errors.push("email já está em uso por outro usuário");
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
