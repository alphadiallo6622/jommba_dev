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

/** "12 aoû 2026 à 14 h 05" — date et heure. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} à ${hh} h ${mm}`;
}

/** "Il y a 3 h", "Il y a 22 min", "Hier", "12 juin 2026"… */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1)  return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Hier";
  if (d < 7)  return `Il y a ${d} j`;
  return formatDate(iso);
}

/** "18 h 12 min" à partir d'une durée en ms. */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "0 min";
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
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