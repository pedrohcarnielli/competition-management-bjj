import { Role, Graduation, User } from "./models";

export const roles: Role[] = ["Aluno", "responsável legal", "responsável técnico", "adm"];

export const minorGraduations: Graduation[] = [
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

export const adultGraduations: Graduation[] = [
    "branca",
    "azul",
    "roxa",
    "marrom",
    "preta"
];

export function calculateAge(birthDate: string): number {
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

export function getAllowedGraduations(age: number): Graduation[] {
    return age < 16 ? minorGraduations : adultGraduations;
}

export interface UserPayload {
    fullName?: string;
    birthDate?: string;
    weight?: number;
    graduation?: Graduation;
    photo?: string;
    email?: string;
    phone?: string;
    roles?: Role[];
    responsibleLegalEmail?: string;
    technicalResponsibleEmail?: string;
}

export function validateUserPayload(
    payload: UserPayload,
    existingUsers: User[],
    currentUserId?: string
): string[] {
    const errors: string[] = [];
    const requiredFields = ["fullName", "birthDate", "weight", "graduation", "email", "phone", "roles"];

    for (const field of requiredFields) {
        if (payload[field as keyof UserPayload] === undefined || payload[field as keyof UserPayload] === null) {
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

    return errors;
}
