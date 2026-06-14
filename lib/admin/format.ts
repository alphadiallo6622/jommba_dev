// lib/admin/format.ts

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const MONTHS = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "aoû", "sep", "oct", "nov", "déc"];
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Génère et télécharge un fichier Excel SpreadsheetML 2003 (.xls). Client only. */
export function downloadXls(filename: string, headers: string[], rows: (string | number)[][]): void {
  const esc = (v: string | number) =>
    String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const mkCell = (v: string | number, bold = false) =>
    `<Cell${bold ? ' ss:StyleID="h"' : ""}><Data ss:Type="String">${esc(v)}</Data></Cell>`;
  const mkRow = (cells: (string | number)[], bold = false) =>
    `<Row>${cells.map((c) => mkCell(c, bold)).join("")}</Row>`;

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<?mso-application progid="Excel.Sheet"?>`,
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
    `<Styles><Style ss:ID="h"><Font ss:Bold="1"/></Style></Styles>`,
    `<Worksheet ss:Name="Données"><Table>`,
    mkRow(headers, true),
    ...rows.map((r) => mkRow(r)),
    `</Table></Worksheet></Workbook>`,
  ].join("\n");

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Génère et télécharge un CSV (BOM UTF-8 pour Excel). Client only. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}