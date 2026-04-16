export type Graduation =
  | "branca"
  | "cinza com branco"
  | "cinza"
  | "cinza com preto"
  | "amarela com branco"
  | "amarela"
  | "amarela com preto"
  | "laranja com branco"
  | "laranja"
  | "laranja com preto"
  | "verde com branco"
  | "verde"
  | "verde com preto"
  | "azul"
  | "roxa"
  | "marrom"
  | "preta";

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
  "verde com preto",
];

export const adultGraduations: Graduation[] = [
  "branca",
  "azul",
  "roxa",
  "marrom",
  "preta",
];

export function getAllowedGraduations(age: number): Graduation[] {
  return age < 16 ? minorGraduations : adultGraduations;
}
