"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./risk-assessment.module.css";
import { ChartLine } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Mesmas cores do action plan ───────────────────────────────────────────────
const RISK_LEVELS = [
  { label: "To 0,5mm", color: "#e5e7eb", text: "#111" },
  { label: "To 1,0mm", color: "#bfdbfe", text: "#111" },
  { label: "To 1,5mm", color: "#fef08a", text: "#111" },
  { label: "To 2,0mm", color: "#fca5a5", text: "#111" },
  { label: "To 2,5mm", color: "#60a5fa", text: "#111" },
  { label: "To 3,0mm", color: "#1e40af", text: "#fff" },
  { label: "To 3,5mm", color: "#7c3aed", text: "#fff" },
  { label: "To 4,0mm", color: "#6b7280", text: "#fff" },
  { label: "Up 4,5mm", color: "#1f2937", text: "#fff" },
];

function getRiskColor(label) {
  return RISK_LEVELS.find(r => r.label === label) ?? { color: "#f3f4f6", text: "#111" };
}

//DEVIATION CHART
function DeviationChart({ deviationCounts }) {
  const riskOrder = [
    "To 0,5mm", "To 1,0mm", "To 1,5mm", "To 2,0mm",
    "To 2,5mm", "To 3,0mm", "To 3,5mm", "To 4,0mm", "Up 4,5mm"
  ];

  const total = riskOrder.reduce((sum, key) => sum + (deviationCounts[key] || 0), 0);

  return (
    <div className={styles.deviationBox}>
      <div className={styles.devTitle}>DEVIATION</div>

      <div className={styles.devMain}>
        {/* Barra horizontal com tamanho fixo e linhas verticais */}
        <div className={styles.devBarContainer}>
          {riskOrder.map((label, index) => {
            const count = deviationCounts[label] || 0;
            const riskInfo = RISK_LEVELS.find(r => r.label === label);

            return (
              <div
                key={label}
                className={styles.devSegment}
                style={{ backgroundColor: riskInfo?.color || "#ccc" }}
              >
                {count > 0 && (
                  <span className={styles.devNumber}>
                    {String(count).padStart(3, "0")}
                  </span>
                )}
                {/* Linha vertical separadora (exceto no último) */}
                {index < riskOrder.length - 1 && (
                  <div className={styles.divider} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className={styles.devLegend}>
          {riskOrder.map((label) => {
            const riskInfo = RISK_LEVELS.find(r => r.label === label);
            return (
              <div key={label} className={styles.legendRow}>
                <div
                  className={styles.legendColor}
                  style={{ backgroundColor: riskInfo?.color || "#ccc" }}
                />
                <span className={styles.legendText}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

//root Cause vertical bar chart
const ROOT_CAUSE_OPTIONS = ["Parts", "Process", "Investigation", "Machine"];
const ROOT_CAUSE_COLORS = {
  Parts: "#93c5fd",   //azul claro
  Process: "#f97316",   //laranja
  Investigation: "#78350f",  // marrom
  Machine: "#6b7280",   //cinza
};

function RootCauseChart({ rootCauseCounts }) {
  const maxVal = Math.max(...Object.values(rootCauseCounts), 1);
  const BAR_H = 120; // px altura máxima das barras

  return (
    <div className={styles.chartBox}>
      <div className={styles.chartTitle}>ROOT CAUSE</div>
      <div className={styles.rootCauseChart}>
        {ROOT_CAUSE_OPTIONS.map(rc => {
          const count = rootCauseCounts[rc] ?? 0;
          const barH = count > 0 ? Math.max(Math.round((count / maxVal) * BAR_H), 6) : 4;
          const color = ROOT_CAUSE_COLORS[rc] ?? "#aaa";
          return (
            <div key={rc} className={styles.rcCol}>
              <span className={styles.rcCount}>{count}</span>
              <div
                className={styles.rcBar}
                style={{ height: barH, background: color }}
              />
              <span className={styles.rcLabel}>{rc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CharacteristicsChart({ charCounts }) {
  const entries = Object.entries(charCounts)
    .sort((a, b) => b[1] - a[1]);   //ordena do maior para o menor

  const maxVal = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className={styles.chartBox}>
      <div className={styles.chartTitle}>CHARACTERISTICS</div>
      
      <div className={styles.charContainer}>
        {entries.map(([label, count]) => {
          const percentage = (count / maxVal) * 100;

          return (
            <div key={label} className={styles.charRow}>
              <span className={styles.charLabel}>{label}</span>
              
              <div className={styles.charBarWrap}>
                <div 
                  className={styles.charBar}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <span className={styles.charCount}>{count}</span>
            </div>
          );
        })}
      </div>

      {/*eixo X*/}
      <div className={styles.charAxisX}>
        {Array.from({ length: 6 }, (_, i) => Math.round((maxVal / 5) * i)).map((value, i) => (
          <span key={i} className={styles.axisNum}>{value}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RiskAssessmentPage() {
  const { group, piece } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Dados derivados dos action plans
  const [deviationCounts, setDeviationCounts] = useState({});
  const [rootCauseCounts, setRootCauseCounts] = useState({});
  const [charCounts, setCharCounts] = useState({});

  const pieceImageUrl = `${API}/pieces/${group}/${piece}/imagens`;

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/pieces/${group}/${piece}/action-plans`)
      .then(r => r.json())
      .then(data => {
        const plans = data.plans ?? [];

        const devCounts = {};
        const rcCounts = {};
        const chrCounts = {};

        plans.forEach(plan => {
          // Root cause: uma contagem por plano (campo analysis)
          const rc = plan.analysis ?? "";
          if (rc) rcCounts[rc] = (rcCounts[rc] ?? 0) + plan.rows.length;

          // Por cada row: risk_level → deviation, symbol → characteristics
          plan.rows.forEach(row => {
            // Deviation
            const rl = row.risk_level ?? "";
            if (rl) devCounts[rl] = (devCounts[rl] ?? 0) + 1;

            // Characteristics (symbol / tipo_geometrico)
            const sym = row.symbol ?? "";
            if (sym) chrCounts[sym] = (chrCounts[sym] ?? 0) + 1;
          });
        });

        setDeviationCounts(devCounts);
        setRootCauseCounts(rcCounts);
        setCharCounts(chrCounts);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [group, piece]);

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button className={styles.backBtn} title="Action Plan"
            onClick={() => router.push(`/analysis/${group}/${piece}/action-plan`)}>
            <ChartLine size={28} />
          </button>
          <div className={styles.toolbarCenter}>
            <span className={styles.toolbarTitle}>RISK ASSESSMENT</span>
            <span className={styles.toolbarSub}>{group} | {piece}</span>
          </div>
          <div style={{ width: 100 }} />
        </div>

        {loading ? (
          <div className={styles.loadingState}>Carregando dados…</div>
        ) : (
          <div className={styles.content}>

            {/*coluna esquerda 3 gráficos*/}
            <div className={styles.chartsCol}>
              <DeviationChart deviationCounts={deviationCounts} />
              <RootCauseChart rootCauseCounts={rootCauseCounts} />
              <CharacteristicsChart charCounts={charCounts} />
            </div>

            {/*coluna direita título + imagem da peça*/}
            <div className={styles.pieceCol}>
              {/*linha azul decorativa topo*/}
              <div className={styles.blueLine} />

              <div className={styles.riskTitle}>
                <h1>RISK</h1>
                <h1>ASSESSMENT</h1>
              </div>

              <div className={styles.pieceInfo}>
                {group} | {piece} 
              </div>

              {/* Imagem da peça */}
              <div className={styles.pieceImageWrap}>
                {imgError ? (
                  <div className={styles.imgPlaceholder}>
                    Imagem não disponível
                  </div>
                ) : (
                  <img
                    src={pieceImageUrl}
                    alt={piece}
                    className={styles.pieceImage}
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}