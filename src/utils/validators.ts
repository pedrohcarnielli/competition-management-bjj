import { User, UserPayload } from "../models";
import { getAllowedGraduations } from "../models/graduation";
import { roles } from "../models/role";
import { calculateAge } from "./age";

function normalizeGraduation(value: string): string {
    return value.trim().toLowerCase();
}

export function validateUserPayload(
    payload: UserPayload,
    existingUsers: User[],
    currentUserId?: string,
    requirePassword = false,
    partial = false
): string[] {
    const errors: string[] = [];
    const requiredFields = ["fullName", "birthDate", "weight", "graduation", "email", "phone", "roles"];
    if (requirePassword) {
        requiredFields.push("password");
    }

    if (!partial) {
        for (const field of requiredFields) {
            if (payload[field as keyof UserPayload] === undefined || payload[field as keyof UserPayload] === null) {
                errors.push(`Campo obrigatório ausente: ${field}`);
            }
        }
    }

    if (partial) {
        if (payload.email !== undefined) {
            errors.push("email não pode ser alterado no update");
        }
        if (payload.password !== undefined) {
            errors.push("password não pode ser alterado no update");
        }
    }

    if (payload.birthDate) {
        const birth = new Date(payload.birthDate);
        if (Number.isNaN(birth.getTime())) {
            errors.push("birthDate deve estar em formato válido YYYY-MM-DD");
        }
    }

    if (payload.roles) {
        const invalidRoles = payload.roles.filter((role) => !roles.includes(role));
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
        const age = calculateAge(payload.birthDate);
        const allowed = getAllowedGraduations(age);
        const normalizedGraduation = normalizeGraduation(payload.graduation);
        if (!allowed.includes(normalizedGraduation as any)) {
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
        } else if (!responsible.roles.includes("responsável legal")) {
            errors.push("responsibleLegalEmail deve apontar para um usuário com role responsável legal");
        }
    }

    if (payload.technicalResponsibleEmail) {
        const responsible = existingUsers.find((user) => user.email === payload.technicalResponsibleEmail && user.id !== currentUserId);
        if (!responsible) {
            errors.push("technicalResponsibleEmail deve ser um email de usuário existente com role responsável técnico");
        } else if (!responsible.roles.includes("responsável técnico")) {
            errors.push("technicalResponsibleEmail deve apontar para um usuário com role responsável técnico");
        }
    }

    if (payload.documentNumber !== undefined) {
        if (typeof payload.documentNumber !== "string" || payload.documentNumber.trim().length === 0) {
            errors.push("documentNumber deve ser uma string não vazia");
        } else {
            // Validação básica de formato de documento (apenas números, pontos, traços)
            const documentRegex = /^[0-9.\-]+$/;
            if (!documentRegex.test(payload.documentNumber.trim())) {
                errors.push("documentNumber deve conter apenas números, pontos e traços");
            }
        }
    }

    return errors;
}
