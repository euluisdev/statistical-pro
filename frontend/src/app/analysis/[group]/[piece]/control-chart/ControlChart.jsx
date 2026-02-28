"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./controlchart.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Mini sparkline SVG ────────────────────────────────────────────────────────
function Sparkline({ values }) {
  if (!values?.length) return null;
  const w = 120, h = 46;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke="#555" strokeWidth="1.5" />
    </svg>
  );
}

// ── Single Control Chart ──────────────────────────────────────────────────────
function SingleChart({ chartData }) {
  const { point, axis, stats, measurements } = chartData;

  const W = 820, H = 185;
  const PAD = { top: 18, right: 10, bottom: 52, left: 46 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const deviations = measurements.map((m) => m.deviation ?? 0);
  const usl    = stats.usl    ?? 1;
  const lsl    = stats.lsl    ?? -1;
  const ucl    = stats.ucl    ?? 0;
  const lcl    = stats.lcl    ?? 0;
  const avg    = stats.mean   ?? 0;

  const allY = [...deviations, usl, lsl, ucl, lcl, avg];
  const yMin = Math.min(...allY) - 0.12;
  const yMax = Math.max(...allY) + 0.12;

  const xScale = (i) => PAD.left + (i / Math.max(deviations.length - 1, 1)) * innerW;
  const yScale = (v) => PAD.top + ((yMax - v) / (yMax - yMin)) * innerH;

  const linePath = deviations
    .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`)
    .join(" ");

  const hLine = (val, color, dash = "") => (
    <line
      x1={PAD.left} y1={yScale(val).toFixed(1)}
      x2={W - PAD.right} y2={yScale(val).toFixed(1)}
      stroke={color} strokeWidth="1.5"
      strokeDasharray={dash}
    />
  );

  // Y-axis ticks automáticos
  const step = parseFloat(((yMax - yMin) / 6).toFixed(2));
  const yTicks = [];
  for (let i = 0; i <= 6; i++) {
    yTicks.push(parseFloat((yMin + i * step).toFixed(2)));
  }

  // X labels (a cada N pontos para não sobrepor)
  const step_x = Math.max(1, Math.floor(deviations.length / 12));

  const cpkNum  = parseFloat(stats.cpk  ?? 0);
  const cpNum   = parseFloat(stats.cp   ?? 0);
  const cpColor  = stats.cp_color  === "green" ? styles.green : styles.red;
  const cpkColor = stats.cpk_color === "green" ? styles.green : styles.red;

  const fmt = (v) =>
    v == null ? "—" : parseFloat(v).toFixed(2).replace(".", ",");

  return (
    <div className={styles.chartRow}>
      <div className={styles.svgWrapper}>
        <svg width={W} height={H}>
          {/* Linhas horizontais */}
          {hLine(avg,  "#00aa00")}
          {hLine(usl,  "#cc2222", "4,3")}
          {hLine(lsl,  "#cc2222", "4,3")}
          {hLine(ucl,  "#4466cc", "6,3")}
          {hLine(lcl,  "#4466cc", "6,3")}
          {hLine(0,    "#aaaaaa", "2,2")}

          {/* Linha de dados */}
          <path d={linePath} fill="none" stroke="#111" strokeWidth="1.8" />

          {/* Pontos */}
          {deviations.map((v, i) => {
            const outSpec = v > usl || v < lsl;
            return (
              <circle
                key={i}
                cx={xScale(i).toFixed(1)}
                cy={yScale(v).toFixed(1)}
                r="4"
                fill={outSpec ? "#cc2222" : "black"}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}

          {/* Y-axis */}
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PAD.left - 4} y1={yScale(t)} x2={PAD.left} y2={yScale(t)} stroke="#666" />
              <text x={PAD.left - 6} y={yScale(t) + 4} textAnchor="end" fontSize="9" fill="#333">
                {t.toFixed(2).replace(".", ",")}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {measurements.map((m, i) => {
            if (i % step_x !== 0) return null;
            return (
              <text
                key={i}
                x={xScale(i)} y={H - 4}
                textAnchor="end" fontSize="7.5" fill="#333"
                transform={`rotate(-65, ${xScale(i)}, ${H - 4})`}
              >
                {m.datetime}
              </text>
            );
          })}

          {/* Border */}
          <rect
            x={PAD.left} y={PAD.top}
            width={innerW} height={innerH}
            fill="none" stroke="#bbb" strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Painel de stats */}
      <div className={styles.statsPanel}>
        <div className={styles.statsHeader}>
          <strong>{point} {axis}</strong>
          <div>SPECIFIED: {fmt(stats.nominal)}</div>
          <div>- {stats.n ?? "?"} Controle(s) -</div>
          <div>Tamanho Amostral: {measurements.length}</div>
        </div>

        <Sparkline values={deviations.slice(-20)} />

        <div className={styles.statsGrid}>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>CP</span>
            <span className={`${styles.statVal} ${cpColor}`}>{fmt(stats.cp)}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>CPK</span>
            <span className={`${styles.statVal} ${cpkColor}`}>{fmt(stats.cpk)}</span>
          </div>

          <div className={styles.statCell}>
            <span className={styles.statLabel}>
              AVERAGE <span className={styles.tiny}>D</span>
            </span>
            <span className={styles.statVal}>{fmt(stats.mean)}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>RANGE</span>
            <span className={styles.statVal}>{fmt(stats.range)}</span>
          </div>

          <div className={styles.statCell}>
            <span className={styles.statLabel}>LIE</span>
            <span className={`${styles.statVal} ${styles.redText}`}>{fmt(stats.lsl)}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>LSE</span>
            <span className={`${styles.statVal} ${styles.redText}`}>{fmt(stats.usl)}</span>
          </div>

          <div className={styles.statCell}>
            <span className={styles.statLabel}>LIC</span>
            <span className={`${styles.statVal} ${styles.blueText}`}>{fmt(stats.lcl)}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>LSC</span>
            <span className={`${styles.statVal} ${styles.blueText}`}>{fmt(stats.ucl)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { label: "CONTROL POINTS", color: "#111", dot: true },
    { label: "AVERAGE",        color: "#00aa00" },
    { label: "LIE / LSE",      color: "#cc2222", dash: "4,3" },
    { label: "LIC / LSC",      color: "#4466cc", dash: "6,3" },
    { label: "Desvio D",       color: "#00aa00", textOnly: true },
    { label: "Medido M",       color: "#228822", textOnly: true },
  ];
  return (
    <div className={styles.legend}>
      {items.map((it) => (
        <div key={it.label} className={styles.legendItem}>
          {it.textOnly ? null : (
            <svg width="30" height="12">
              <line
                x1="0" y1="6" x2="30" y2="6"
                stroke={it.color} strokeWidth="1.5"
                strokeDasharray={it.dash ?? ""}
              />
              {it.dot && <circle cx="15" cy="6" r="4" fill={it.color} />}
            </svg>
          )}
          <span style={{ color: it.textOnly ? it.color : "#333" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function ConfigModal({ group, piece, onClose, onGenerate }) {
  const [points, setPoints]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/control-chart/${group}/${piece}/points`)
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((data) => { setPoints(data.points); setLoading(false); })
      .catch((e)   => { setError(e.message);   setLoading(false); });
  }, [group, piece]);

  const togglePoint = (id) =>
    setSelected((prev) => ({ ...prev, [id]: prev[id] ? undefined : { axes: [] } }));

  const toggleAxis = (pointId, axis) =>
    setSelected((prev) => {
      const curr = prev[pointId] || { axes: [] };
      const axes = curr.axes.includes(axis)
        ? curr.axes.filter((a) => a !== axis)
        : [...curr.axes, axis];
      return { ...prev, [pointId]: { ...curr, axes } };
    });

  const handleGenerate = () => {
    const selections = Object.entries(selected)
      .filter(([, v]) => v?.axes?.length > 0)
      .flatMap(([id, v]) => v.axes.map((axis) => ({ point: id, axis })));
    if (!selections.length) { alert("Selecione pelo menos um ponto e eixo."); return; }
    onGenerate(selections);
    onClose();
  };

  const hasSelection = Object.values(selected).some((v) => v?.axes?.length > 0);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Configurar Control Chart</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {/* Coluna esquerda – pontos da API */}
          <div className={styles.modalCol}>
            <div className={styles.modalColTitle}>Pontos de Medição</div>
            {loading && <div className={styles.loadingMsg}>Carregando pontos…</div>}
            {error   && <div className={styles.errorMsg}>Erro: {error}</div>}
            {!loading && !error && (
              <div className={styles.pointList}>
                {points.map((pt) => {
                  const isOpen = !!selected[pt.id];
                  return (
                    <div
                      key={pt.id}
                      className={`${styles.pointItem} ${isOpen ? styles.pointSelected : ""}`}
                    >
                      <div className={styles.pointHeader} onClick={() => togglePoint(pt.id)}>
                        <span className={styles.pointCheck}>{isOpen ? "▼" : "▶"}</span>
                        <span className={styles.pointLabel}>{pt.label}</span>
                        <span className={styles.pointType}>{pt.tipo}</span>
                      </div>
                      {isOpen && (
                        <div className={styles.axisRow}>
                          {pt.axes.map((ax) => {
                            const active = selected[pt.id]?.axes.includes(ax);
                            return (
                              <button
                                key={ax}
                                className={`${styles.axisBtn} ${active ? styles.axisBtnActive : ""}`}
                                onClick={() => toggleAxis(pt.id, ax)}
                              >
                                {ax}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna direita – seleção atual */}
          <div className={styles.modalCol}>
            <div className={styles.modalColTitle}>Seleção Atual</div>
            <div className={styles.selectionSummary}>
              {!hasSelection && (
                <div className={styles.emptyMsg}>Nenhum eixo selecionado ainda</div>
              )}
              {Object.entries(selected)
                .filter(([, v]) => v?.axes?.length > 0)
                .map(([id, v]) => (
                  <div key={id} className={styles.summaryRow}>
                    <span className={styles.summaryPoint}>{id}</span>
                    <span className={styles.summaryAxes}>
                      {v.axes.map((a) => (
                        <span key={a} className={styles.axisTag}>{a}</span>
                      ))}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.generateBtn} onClick={handleGenerate}>
            Gerar Gráfico
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Placeholder estático ──────────────────────────────────────────────────────
function StaticPlaceholder({ group, piece }) {
  return (
    <>
      <div className={styles.header}>
        <h1>CONTROL CHART</h1>
        <h2>{group} – {piece}</h2>
        <p className={styles.subtitle}>Individual Values</p>
      </div>
      <div className={styles.divider} />
      <div className={styles.placeholderArea}>
        <div className={styles.placeholderChart} />
        <div className={styles.placeholderChart} />
        <div className={styles.placeholderChart} />
        <div className={styles.placeholderHint}>
          Clique em <strong>⚙ Configurar</strong> para gerar os gráficos
        </div>
      </div>
    </>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────
function LoadingCharts() {
  return (
    <div className={styles.loadingCharts}>
      <div className={styles.spinner} />
      <span>Carregando gráficos…</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ControlChart({ params }) {
  const { group, piece } = params;
  const router = useRouter();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [chartsData,   setChartsData]   = useState(null);   // null = placeholder
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartError,   setChartError]   = useState(null);

  const handleGenerate = useCallback(async (selections) => {
    setLoadingCharts(true);
    setChartsData(null);
    setChartError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/control-chart/${group}/${piece}/charts`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ selections }),
        }
      );
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setChartsData(data.charts);
    } catch (e) {
      setChartError(e.message);
    } finally {
      setLoadingCharts(false);
    }
  }, [group, piece]);

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>
            ← Voltar
          </button>
          <button className={styles.openBtn} onClick={() => setModalOpen(true)}>
            ⚙ Configurar
          </button>
        </div>

        {/* Conteúdo principal */}
        {loadingCharts ? (
          <LoadingCharts />
        ) : chartError ? (
          <div className={styles.errorFull}>
            <p>Erro ao carregar gráficos: {chartError}</p>
            <button onClick={() => setChartError(null)}>Tentar novamente</button>
          </div>
        ) : !chartsData ? (
          <StaticPlaceholder group={group} piece={piece} />
        ) : (
          <>
            <div className={styles.header}>
              <h1>CONTROL CHART</h1>
              <h2>{group} – {piece}</h2>
              <p className={styles.subtitle}>Individual Values</p>
            </div>
            <div className={styles.divider} />
            <Legend />
            <div className={styles.chartsContainer}>
              {chartsData.map((cd, i) =>
                cd.error ? (
                  <div key={i} className={styles.chartError}>
                    {cd.point} {cd.axis}: {cd.error}
                  </div>
                ) : (
                  <SingleChart key={i} chartData={cd} />
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <ConfigModal
          group={group}
          piece={piece}
          onClose={() => setModalOpen(false)}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
}