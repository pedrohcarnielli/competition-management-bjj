export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birthYear = Number.parseInt(birthDate.slice(0, 4), 10);

  // Regra de negocio: idade considera apenas ano de nascimento.
  return today.getFullYear() - birthYear;
}
