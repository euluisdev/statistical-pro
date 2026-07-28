"use client";

//rota: /analysis/GROUP/PIECE/action-plan/print?start=0&end=9
//
//estou renderizando apenas a tabela ActionPlan - sem navbar, sem toolbar, sem modal
//somente com os planos de startIdx até endIdx
//a playwright abre esta URL e tira o screenshot

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "../actionplan.module.css";
import printStyles from "./print.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const fmt = (v) =>
  v == null ? "—" : parseFloat(v).toFixed(2).replace(".", ",");

function cpkColor(val) {
  if (val == null) return "transparent";
  const n = parseFloat(val);
  if (n >= 1.33) return "green";
  if (n >= 1.0)  return "yellow";
  return "red";
}

function xmedColor(xmed, lse, lie) {
  if (xmed == null) return "transparent";
  const tol = Math.min(Math.abs(lse ?? Infinity), Math.abs(lie ?? Infinity));
  if (!isFinite(tol) || tol === 0) return "transparent";
  return Math.abs(parseFloat(xmed)) > tol * 0.5 ? "red" : "green";
}

function cpColor(val) {
  if (val == null) return "transparent";
  const n = parseFloat(val);
  if (n >= 1.33) return "green";
  if (n >= 1.0)  return "yellow";
  return "red";
}

function getRiskBackgroundColor(risk) {
  const map = {
    "To 0,5mm": "#e5e7eb", "To 1,0mm": "#bfdbfe",
    "To 1,5mm": "#fef08c", "To 2,0mm": "#fca5a5",
    "To 2,5mm": "#60a5fa", "To 3,0mm": "#1e40af",
    "To 3,5mm": "#7c3aed", "To 4,0mm": "#6b7280",
    "Up 4,5mm": "#1f2937",
  };
  return map[risk] ?? "transparent";
}

function getRiskTextColor(risk) {
  return ["To 3,0mm","To 3,5mm","To 4,0mm","Up 4,5mm"].includes(risk)
    ? "#fff" : "#111";
}

function getSlidingWeeks() {
  const today = new Date();
  const getWeek = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  };
  const isoWeek = getWeek(today);
  const startWeek = Math.max(1, isoWeek - 4);
  const weeks = [];
  for (let i = 0; i < 10; i++) {
    let w = startWeek + i;
    if (w > 53) w -= 53;
    weeks.push(String(w).padStart(2, "0"));
  }
  return { weeks, currentWeek: String(isoWeek).padStart(2, "0") };
}

//tabela - reutiliza a lógica do ActionPlan principal
function PrintTable({ plans, group, piece, weeks, currentWeek }) {
  const rowCount = (plan) => plan.rows.length;

  return (
    <table className={styles.table} id="print-table">
      <thead>
        <tr>
          <th colSpan={15} className={styles.thPiece}>
            {piece} | ACTION PLAN
          </th>
          <th colSpan={weeks.length + 1} className={styles.thSemana}>SEMANA</th>
        </tr>
        <tr>
          <th className={styles.th}>SEQ</th>
          <th className={styles.th}>LABEL</th>
          <th className={styles.th}>AXIS</th>
          <th className={styles.th}>LSE</th>
          <th className={styles.th}>LIE</th>
          <th className={styles.th}>SYMBOL</th>
          <th className={styles.th}>XMED</th>
          <th className={styles.th}>CP</th>
          <th className={styles.th}>CPK</th>
          <th className={styles.th}>RANGE</th>
          <th className={`${styles.th} ${styles.thVertical}`}>
            <span className={styles.verticalText}>RISK - Desviation</span>
          </th>
          <th className={`${styles.th} ${styles.thVertical}`}>
            <span className={styles.verticalText}>RISK - Root Cause</span>
          </th>
          <th className={styles.th}>ACTION PLAN</th>
          <th className={styles.th}>RESPONSIBLE</th>
          <th className={styles.th}>DATA</th>
          {weeks.map((w) => (
            <th key={w}
              className={`${styles.th} ${styles.thWeek} ${w === currentWeek ? styles.thWeekCurrent : ""}`}>
              {w}
            </th>
          ))}
          <th className={styles.th}>STATUS</th>
        </tr>
      </thead>
      <tbody>
        {plans.map((plan) =>
          plan.rows.map((row, ri) => (
            <tr key={`${plan.seq}-${ri}`}
              className={ri % 2 === 0 ? styles.trEven : styles.trOdd}>

              {ri === 0 && (
                <td rowSpan={rowCount(plan)} className={styles.tdSeq}>
                  <div className={styles.seqCell}>
                    <span>{String(plan.seq).padStart(3, "0")}</span>
                  </div>
                </td>
              )}

              <td className={styles.td}>{row.label}</td>
              <td className={styles.td}>{row.axis}</td>
              <td className={styles.td}>{fmt(row.lse)}</td>
              <td className={styles.td}>{fmt(row.lie)}</td>
              <td className={styles.tdSymbol}>{row.symbol}</td>

              <td className={styles.td} style={{
                background: xmedColor(row.xmed, row.lse, row.lie),
                color: xmedColor(row.xmed, row.lse, row.lie) !== "transparent" ? "white" : "inherit",
                fontWeight: "bold",
              }}>{fmt(row.xmed)}</td>

              <td className={styles.td} style={{
                background: cpColor(row.cp),
                color: cpColor(row.cp) !== "transparent" ? "white" : "inherit",
                fontWeight: "bold",
              }}>{fmt(row.cp)}</td>

              <td className={`${styles.td} ${styles.tdCpk}`} style={{
                background: cpkColor(row.cpk),
                color: cpkColor(row.cpk) !== "transparent" ? "white" : "inherit",
              }}>{fmt(row.cpk)}</td>

              <td className={styles.td}>{fmt(row.range)}</td>

              <td className={styles.tdVertical} style={{
                backgroundColor: getRiskBackgroundColor(row.risk_level),
                color: getRiskTextColor(row.risk_level),
              }}>
                <span className={styles.verticalText}>{row.risk_level || "—"}</span>
              </td>

              <td className={styles.tdVertical}>
                <span className={styles.verticalText}>{plan.analysis}</span>
              </td>

              {ri === 0 && (
                <>
                  <td rowSpan={rowCount(plan)} className={styles.tdAction}>
                    {plan.action_text}
                  </td>
                  <td rowSpan={rowCount(plan)} className={styles.tdResp}>
                    {plan.responsible_name}
                    {plan.responsible_dept ? ` (${plan.responsible_dept})` : ""}
                  </td>
                  <td rowSpan={rowCount(plan)} className={styles.tdDate}>
                    {plan.deadline_date || ""}
                  </td>
                  {weeks.map((w) => {
                    const ws  = plan.week_statuses?.find((x) => x.week === w);
                    const val = ws?.value || "";
                    return (
                      <td key={w} rowSpan={rowCount(plan)}
                        className={`${styles.tdWeek} ${w === currentWeek ? styles.tdWeekCurrent : ""}`}
                        style={{
                          background:
                            val === "X"   ? "#aad4f5" :
                            val === "NOK" ? "#ffaaaa" :
                            val === "R"   ? "#ffe099" : "transparent",
                        }}>
                        {val}
                      </td>
                    );
                  })}
                  <td rowSpan={rowCount(plan)} className={styles.tdStatus}>
                    {plan.status}
                  </td>
                </>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

//print page
export default function ActionPlanPrintPage() {
  const { group, piece } = useParams();
  const searchParams     = useSearchParams();

  const start = parseInt(searchParams.get("start") ?? "0");
  const end   = parseInt(searchParams.get("end")   ?? "9999");

  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  const { weeks, currentWeek } = getSlidingWeeks();

  useEffect(() => {
    fetch(`${API}/pieces/${group}/${piece}/action-plans`)
      .then((r) => r.json())
      .then((d) => {
        //filter only the plans of the slice this page
        const all    = (d.plans ?? []).sort((a, b) => a.seq - b.seq);
        const sliced = all.slice(start, end + 1);
        setPlans(sliced);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [group, piece, start, end]);

  if (loading) {
    //id especial - playwright espera este elemento antes de tirar o screenshot
    return (
      <div id="print-loading" style={{ padding: 40, fontFamily: "Arial" }}>
        Carregando…
      </div>
    );
  }

  return (
    //id que a playwright usa como seletor de captura
    <div id="action-plan-table" className={printStyles.printRoot}>
      <PrintTable
        plans={plans}
        group={group}
        piece={piece}
        weeks={weeks}
        currentWeek={currentWeek}
      />
      <div className={styles.legend}>
        X — Ação programada &nbsp;|&nbsp; NOK — Ação não efetiva &nbsp;|&nbsp; R — Ação reprogramada
      </div>
    </div>
  );
}  
 
 
 