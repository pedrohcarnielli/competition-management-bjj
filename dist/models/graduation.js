"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adultGraduations = exports.minorGraduations = void 0;
exports.getAllowedGraduations = getAllowedGraduations;
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
    "verde com preto",
];
exports.adultGraduations = [
    "branca",
    "azul",
    "roxa",
    "marrom",
    "preta",
];
function getAllowedGraduations(age) {
    return age < 16 ? exports.minorGraduations : exports.adultGraduations;
}
