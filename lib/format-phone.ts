export function formatarTelefone(valorBruto: string): string {
  const digitos = valorBruto.replace(/\D/g, "").slice(0, 11);

  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return "(" + digitos;

  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);

  if (resto.length <= 4) {
    return "(" + ddd + ") " + resto;
  }
  if (digitos.length <= 10) {
    return "(" + ddd + ") " + resto.slice(0, 4) + "-" + resto.slice(4);
  }
  return "(" + ddd + ") " + resto.slice(0, 5) + "-" + resto.slice(5);
}
