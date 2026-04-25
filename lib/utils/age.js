"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = calculateAge;
function calculateAge(birthDate) {
    const today = new Date();
    const birthYear = Number.parseInt(birthDate.slice(0, 4), 10);
    // Regra de negocio: idade considera apenas ano de nascimento.
    return today.getFullYear() - birthYear;
}
