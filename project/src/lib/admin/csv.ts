import "server-only";

// Geração de CSV para o Excel brasileiro.
//
// Duas armadilhas tratadas aqui:
// 1. Separador: o Excel em português espera ponto e vírgula, não vírgula.
// 2. Injeção de fórmula: um valor começando com = + - @ (ou TAB/CR) é executado como
//    fórmula ao abrir a planilha. Um lead com nome "=HYPERLINK(...)" viraria um clique
//    perigoso na máquina de quem abriu. Por isso o valor recebe um apóstrofo na frente.

const RISKY = /^[=+\-@\t\r]/;

function cell(value: string | null | undefined): string {
  const raw = (value ?? "").replace(/\r?\n/g, " ").trim();
  const safe = RISKY.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: (string | null | undefined)[][]): string {
  const lines = [headers.map(cell).join(";"), ...rows.map((row) => row.map(cell).join(";"))];
  // BOM: sem ele o Excel abre o arquivo como Latin-1 e quebra todo acento.
  return `﻿${lines.join("\r\n")}\r\n`;
}

export function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
