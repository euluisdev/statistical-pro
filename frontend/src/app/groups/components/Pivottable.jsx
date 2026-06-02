"use client";

import { useMemo } from "react";
import "./pivot-table.css";

export default function PivotTable({ parsedData }) {
  const pivoted = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return { rows: [], dates: [] };

    const sample = parsedData[0];
    const keys = Object.keys(sample);

    //detecta campo de relatório (coluna que representa o ciclo/data da medição)
    const reportKey =
      keys.find((k) => k === "Relato") ||
      keys.find((k) => k === "Relatório") ||
      keys.find((k) => k === "Data") ||
      null;

    //mapeamento de colunas com fallbacks
    const colMap = {
      NomePonto:      ["NomePonto", "Ponto", "nome_ponto"],
      Eixo:           ["Eixo", "eixo"],
      Localização:    ["Localização", "Localizacao", "Loc", "Localizacão"],
      TipoGeométrico: ["TipoGeométrico", "TipoGeometrico", "Tipo"],
      Nominal:        ["Nominal", "nominal"],
      "Tol+":         ["Tol+", "TolPlus", "tol_plus"],
      "Tol-":         ["Tol-", "TolMinus", "tol_minus"],
    };

    const resolveCol = (key) =>
      (colMap[key] || [key]).find((c) => keys.includes(c)) || key;

    const ID_COLS = ["NomePonto", "Eixo", "Localização", "TipoGeométrico", "Nominal", "Tol+", "Tol-"];
    const resolved = ID_COLS.map((k) => ({ label: k, real: resolveCol(k) }));

    const desvioKey = ["Desvio", "desvio"].find((k) => sample.hasOwnProperty(k)) || "Desvio";

    // Coleta datas únicas na ordem de aparição
    const datesSet = new Set();
    parsedData.forEach((row) => {
      if (reportKey && row[reportKey] != null) datesSet.add(String(row[reportKey]));
    });
    const dates = Array.from(datesSet);

    // Agrupamento por identidade do ponto
    const rowKey = (row) => resolved.map(({ real }) => String(row[real] ?? "")).join("||");
    const map = new Map();

    parsedData.forEach((row) => {
      const key = rowKey(row);
      if (!map.has(key)) {
        const meta = {};
        resolved.forEach(({ label, real }) => { meta[label] = row[real] ?? ""; });
        map.set(key, { meta, desvios: new Map() });
      }
      const date = reportKey ? String(row[reportKey]) : "—";
      map.get(key).desvios.set(date, row[desvioKey] ?? "");
    });

    return { rows: Array.from(map.values()), dates };
  }, [parsedData]);

  if (!parsedData || parsedData.length === 0) return null;

  const { rows, dates } = pivoted;

  // Define classe de cor do desvio comparando com tolerâncias
  const desvioClass = (meta, val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "";
    const tolP = parseFloat(meta["Tol+"]);
    const tolM = parseFloat(meta["Tol-"]);
    if (!isNaN(tolP) && !isNaN(tolM)) {
      if (n > tolP || n < tolM) return "pt-fail";
      if (Math.abs(n) >= Math.abs(tolP) * 0.8) return "pt-warn";
      return "pt-ok";
    }
    return "";
  };

  //classes sticky com offset
  const S = ["pt-sticky pt-s1", "pt-sticky pt-s2", "pt-sticky pt-s3",
             "pt-sticky pt-s4", "pt-sticky pt-s5", "pt-sticky pt-s6",
             "pt-sticky pt-s7"];

  return (
    <div className="pivot-wrapper">
      {/* Barra de título */}
      <div className="pivot-header-bar">
        <span className="pivot-title">
          Dados Pivotados — {rows.length} pontos · {dates.length} relatórios
        </span>
        <span className="pivot-legend">
          <span className="leg leg-ok">✓ OK</span>
          <span className="leg leg-warn">⚠ Limite</span>
          <span className="leg leg-fail">✗ Fora</span>
        </span>
      </div>

      {/* Scroll container */}
      <div className="pivot-scroll-container">
        <table className="pivot-table">
          <thead>
            <tr>
              <th className={S[0] + " pt-left"}>Ponto</th>
              <th className={S[1] + " pt-center"}>Eixo</th>
              <th className={S[2] + " pt-left"}>Loc</th>
              <th className={S[3] + " pt-left"}>Tipo</th>
              <th className={S[4] + " pt-right"}>Nominal</th>
              <th className={S[5] + " pt-center"}>Tol+</th>
              <th className={S[6] + " pt-center"}>Tol−</th>
              {dates.map((d) => (
                <th key={d} className="pt-date">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className={S[0] + " pt-left"}>{row.meta["NomePonto"]}</td>
                <td className={S[1] + " pt-axis"}>{row.meta["Eixo"]}</td>
                <td className={S[2] + " pt-left"}>{row.meta["Localização"]}</td>
                <td className={S[3] + " pt-left pt-type"}>{row.meta["TipoGeométrico"]}</td>
                <td className={S[4] + " pt-right"}>{row.meta["Nominal"]}</td>
                <td className={S[5] + " pt-tolp"}>{row.meta["Tol+"]}</td>
                <td className={S[6] + " pt-tolm"}>{row.meta["Tol-"]}</td>
                {dates.map((d) => {
                  const val = row.desvios.get(d);
                  const cls = desvioClass(row.meta, val);
                  return (
                    <td key={d} className={`pt-desvio ${cls}`}>
                      {val !== undefined && val !== "" ? Number(val).toFixed(3) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
 
 