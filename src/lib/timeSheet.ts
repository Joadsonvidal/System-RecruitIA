import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TimeClockEntry } from "@/hooks/useTimeClock";

const WD_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface SheetRow {
  date: Date;
  weekday: string;
  ent1: string;
  sai1: string;
  ent2: string;
  sai2: string;
  credito: string;
  debito: string;
  horaInterv: string;
  horaTrab: string;
  saldo: string;
  obs: string;
  isWeekend: boolean;
  hasIssue: boolean;
}

export interface MonthlySheet {
  rows: SheetRow[];
  totalCredito: number; // minutes
  totalDebito: number;
  saldoFinal: number;
}

const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

const fmtDate = (d: Date) =>
  `${WD_SHORT[d.getDay()]}, ${d.toLocaleDateString("pt-BR")}`;

const minutesToHHMM = (m: number) => {
  const sign = m < 0 ? "-" : "";
  const abs = Math.abs(m);
  const h = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${sign}${String(h).padStart(1, "0")}:${String(mm).padStart(2, "0")}`;
};

const parseHHMM = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const buildMonthlyTimeSheet = (
  entries: TimeClockEntry[],
  year: number,
  month: number, // 0-11
  opts: { workdayStart: string; workdayEnd: string },
): MonthlySheet => {
  const expectedDailyMin = parseHHMM(opts.workdayEnd) - parseHHMM(opts.workdayStart) - 60; // -1h almoço
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay: Record<string, TimeClockEntry[]> = {};
  for (const e of entries) {
    const d = new Date(e.clocked_at);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const key = String(d.getDate());
    (byDay[key] ||= []).push(e);
  }

  const rows: SheetRow[] = [];
  let totalCredito = 0;
  let totalDebito = 0;
  let saldoAcc = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayEntries = (byDay[String(day)] || []).sort(
      (a, b) => new Date(a.clocked_at).getTime() - new Date(b.clocked_at).getTime(),
    );

    const find = (t: string) => dayEntries.find((e) => e.entry_type === t);
    const eEnt1 = find("entrada");
    const eSai1 = find("saida_almoco");
    const eEnt2 = find("retorno_almoco");
    const eSai2 = find("saida");

    const ent1 = eEnt1 ? new Date(eEnt1.clocked_at) : null;
    const sai1 = eSai1 ? new Date(eSai1.clocked_at) : null;
    const ent2 = eEnt2 ? new Date(eEnt2.clocked_at) : null;
    const sai2 = eSai2 ? new Date(eSai2.clocked_at) : null;

    let trabMin = 0;
    let intervMin = 0;
    let obs = "";
    let hasIssue = false;

    if (ent1 && sai1) trabMin += (sai1.getTime() - ent1.getTime()) / 60000;
    if (ent2 && sai2) trabMin += (sai2.getTime() - ent2.getTime()) / 60000;
    if (sai1 && ent2) intervMin = (ent2.getTime() - sai1.getTime()) / 60000;

    // Detecta saídas faltando
    if (dayEntries.length > 0 && (!sai2 || (ent1 && !sai1 && !ent2 && !sai2))) {
      if (!sai2 && ent1) {
        obs = "(não registrou a saída)";
        hasIssue = true;
      }
    }

    const isFutureDate = date > new Date();
    let credito = 0;
    let debito = 0;

    if (isWeekend && dayEntries.length === 0) {
      obs = "Folga";
    } else if (!isFutureDate && !isWeekend) {
      const diff = Math.round(trabMin) - expectedDailyMin;
      if (dayEntries.length === 0) {
        debito = expectedDailyMin;
        obs = obs || "Faltou";
      } else if (diff > 0) credito = diff;
      else if (diff < 0) debito = -diff;
    }

    totalCredito += credito;
    totalDebito += debito;
    saldoAcc += credito - debito;

    rows.push({
      date,
      weekday: fmtDate(date),
      ent1: fmtTime(ent1),
      sai1: fmtTime(sai1),
      ent2: fmtTime(ent2),
      sai2: fmtTime(sai2),
      credito: credito > 0 ? minutesToHHMM(credito) : "0:00",
      debito: debito > 0 ? minutesToHHMM(debito) : "0:00",
      horaInterv: intervMin > 0 ? minutesToHHMM(Math.round(intervMin)) : "0:00",
      horaTrab: trabMin > 0 ? minutesToHHMM(Math.round(trabMin)) : "0:00",
      saldo: minutesToHHMM(saldoAcc),
      obs,
      isWeekend,
      hasIssue,
    });
  }

  return { rows, totalCredito, totalDebito, saldoFinal: saldoAcc };
};

export const exportTimeSheetPDF = (params: {
  employeeName: string;
  employeeEmail: string;
  monthLabel: string;
  rows: SheetRow[];
}) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(params.employeeName.toUpperCase(), 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(params.employeeEmail, 14, 21);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Espelho de Ponto — ${params.monthLabel}`, pageWidth - 14, 15, { align: "right" });

  autoTable(doc, {
    startY: 28,
    head: [
      [
        { content: "PONTOS", colSpan: 5, styles: { halign: "center", fillColor: [240, 240, 240], textColor: 40 } },
        { content: "RESUMO DE JORNADA", colSpan: 5, styles: { halign: "center", fillColor: [240, 240, 240], textColor: 40 } },
        { content: "", styles: { fillColor: [240, 240, 240] } },
      ],
      [
        "DATA", "1ª ENTRADA", "1ª SAÍDA", "2ª ENTRADA", "2ª SAÍDA",
        "CRÉDITO", "DÉBITO", "HORA INTERV.", "HORA TRAB.", "SALDO", "OBS",
      ],
    ],
    body: params.rows.map((r) => [
      r.weekday, r.ent1, r.sai1, r.ent2, r.sai2,
      r.credito, r.debito, r.horaInterv, r.horaTrab, r.saldo, r.obs,
    ]),
    styles: { fontSize: 8, cellPadding: 1.5, halign: "center" },
    headStyles: { fillColor: [250, 250, 250], textColor: 40, fontStyle: "bold", lineWidth: 0.1, lineColor: [200, 200, 200] },
    bodyStyles: { lineWidth: 0.1, lineColor: [220, 220, 220] },
    columnStyles: {
      0: { halign: "left", cellWidth: 32 },
      10: { halign: "left", cellWidth: 50 },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const r = params.rows[data.row.index];
      if (!r) return;
      if (r.isWeekend) data.cell.styles.fillColor = [245, 245, 245];
      if (r.hasIssue) data.cell.styles.fillColor = [255, 247, 220];
      if (data.column.index === 5 && r.credito !== "0:00") data.cell.styles.textColor = [0, 130, 60];
      if (data.column.index === 6 && r.debito !== "0:00") data.cell.styles.textColor = [200, 30, 30];
      if (data.column.index === 10 && r.hasIssue) data.cell.styles.textColor = [200, 90, 30];
    },
  });

  doc.save(`espelho-ponto-${params.monthLabel.replace(/\s+/g, "-")}.pdf`);
};
