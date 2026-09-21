// Dobra de texto para busca: minúsculas e sem acento.
//
// O LIKE do SQLite não dobra acentuação, então quem grava e quem procura precisam
// usar exatamente a mesma função — por isso ela mora sozinha aqui, sem depender de
// nada, e serve tanto ao servidor (gravação e consulta) quanto ao navegador
// (filtro do Page Editor).
//
// NFD separa a letra do sinal; a classe de marcas combinantes remove o sinal.

const COMBINING = /\p{M}/gu;

export function fold(value: string): string {
  return value.normalize("NFD").replace(COMBINING, "").toLowerCase().trim();
}
