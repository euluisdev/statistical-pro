"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./controlchart.module.css";
import { useSaveControlChartToJob } from "@/app/hooks/useSaveControlChartToJob";
import { ArrowBigRight, Grid3x3, SaveAll, Settings } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
// Recebe onRef para registrar o elemento no hook de captura.
function SingleChart({ chartData, onRef }) {
  const { point, axis, stats, measurements } = chartData;
  const rowRef = useRef(null);

  // Registra/desregistra a ref no hook pai
  useEffect(() => {
    if (onRef) onRef(point, axis, rowRef.current);
    return () => {
      if (onRef) onRef(point, axis, null);
    };
  }, [point, axis, onRef]);

  const W = 820, H = 185;
  const PAD = { top: 18, right: 10, bottom: 60, left: 46 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const deviations = measurements.map((m) => m.deviation ?? 0);
  const usl = stats.usl ?? 1;
  const lsl = stats.lsl ?? -1;
  const ucl = stats.ucl ?? 0;
  const lcl = stats.lcl ?? 0;
  const avg = stats.mean ?? 0;

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
      stroke={color} strokeWidth="1.5" strokeDasharray={dash}
    />
  );

  const step = parseFloat(((yMax - yMin) / 6).toFixed(2));
  const yTicks = Array.from({ length: 7 }, (_, i) =>
    parseFloat((yMin + i * step).toFixed(2))
  );

  const step_x = Math.max(1, Math.floor(deviations.length / 14));

  const cpColor = stats.cp_color === "green" ? styles.green : styles.red;
  const cpkColor = stats.cpk_color === "green" ? styles.green : styles.red;

  const fmt = (v) =>
    v == null ? "—" : parseFloat(v).toFixed(2).replace(".", ",");

  return (
    <div className={styles.chartRow} ref={rowRef}>
      <div className={styles.svgWrapper}>
        <svg width={W} height={H}>
          {hLine(avg, "green")}
          {hLine(usl, "red", "4,3")}
          {hLine(lsl, "red", "4,3")}
          {hLine(ucl, "#4466cc", "6,3")}
          {hLine(lcl, "#4466cc", "6,3")}
          {hLine(0, "#aaaaaa", "2,2")}

          <path d={linePath} fill="none" stroke="#111" strokeWidth="1.8" />

          {deviations.map((v, i) => {
            const outSpec = v > usl || v < lsl;
            return (
              <circle
                key={i}
                cx={xScale(i).toFixed(1)} cy={yScale(v).toFixed(1)}
                r="4"
                fill={outSpec ? "#cc2222" : "black"}
                stroke="white" strokeWidth="1"
              />
            );
          })}

          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PAD.left - 4} y1={yScale(t)} x2={PAD.left} y2={yScale(t)} stroke="#666" />
              <text x={PAD.left - 6} y={yScale(t) + 4} textAnchor="end" fontSize="9" fill="black">
                {t.toFixed(2).replace(".", ",")}
              </text>
            </g>
          ))}

          {measurements.map((m, i) => {
            if (i % step_x !== 0) return null;
            const cx = xScale(i);
            const baseY = PAD.top + innerH;
            const [datePart, timePart] = m.datetime.split("\n");
            return (
              <g key={i}>
                <text x={cx} y={baseY + 10} textAnchor="middle" fontSize="7" fill="black">
                  {datePart}
                </text>
                {timePart && (
                  <text x={cx} y={baseY + 20} textAnchor="middle" fontSize="7" fill="black">
                    {timePart}
                  </text>
                )}
              </g>
            );
          })}

          <rect
            x={PAD.left} y={PAD.top} width={innerW} height={innerH}
            fill="none" stroke="#bbb" strokeWidth="0.5"
          />
        </svg>
      </div>

      <div className={styles.statsPanel}>
        <div className={styles.statsHeader}>
          <strong>{point} {axis}</strong>
          <div>SPECIFIED: {fmt(stats.nominal)}</div>
          <div>- {stats.n ?? measurements.length} Controle(s) -</div>
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

//legend
function Legend() {
  const items = [
    { label: "CONTROL POINTS", color: "#111", dot: true },
    { label: "AVERAGE", color: "green" },
    { label: "LIE / LSE", color: "red", dash: "4,3" },
    { label: "LIC / LSC", color: "blue", dash: "6,3" },
    { label: "Desvio D", color: "#00aa00", textOnly: true },
    { label: "Medido M", color: "#228822", textOnly: true },
  ];
  return (
    <div className={styles.legend}>
      {items.map((it) => (
        <div key={it.label} className={styles.legendItem}>
          {!it.textOnly && (
            <svg width="30" height="12">
              <line x1="0" y1="6" x2="30" y2="6"
                stroke={it.color} strokeWidth="1.5"
                strokeDasharray={it.dash ?? ""} />
              {it.dot && <circle cx="15" cy="6" r="4" fill={it.color} />}
            </svg>
          )}
          <span style={{ color: it.textOnly ? it.color : "black" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

//modal de configuração
function ConfigModal({ group, piece, onClose, onGenerate }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/pieces/${group}/${piece}/points`)
      .then((r) => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json(); })
      .then((d) => { setPoints(d.points); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
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
          <div className={styles.modalCol}>
            <div className={styles.modalColTitle}>Pontos de Medição</div>
            {loading && <div className={styles.loadingMsg}>Carregando pontos…</div>}
            {error && <div className={styles.errorMsg}>Erro: {error}</div>}
            {!loading && !error && (
              <div className={styles.pointList}>
                {points.map((pt) => {
                  const isOpen = !!selected[pt.id];
                  return (
                    <div key={pt.id}
                      className={`${styles.pointItem} ${isOpen ? styles.pointSelected : ""}`}>
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
                              <button key={ax}
                                className={`${styles.axisBtn} ${active ? styles.axisBtnActive : ""}`}
                                onClick={() => toggleAxis(pt.id, ax)}>
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

          <div className={styles.modalCol}>
            <div className={styles.modalColTitle}>Seleção Atual</div>
            <div className={styles.selectionSummary}>
              {!hasSelection && <div className={styles.emptyMsg}>Nenhum eixo selecionado ainda</div>}
              {Object.entries(selected)
                .filter(([, v]) => v?.axes?.length > 0)
                .map(([id, v]) => (
                  <div key={id} className={styles.summaryRow}>
                    <span className={styles.summaryPoint}>{id}</span>
                    <span className={styles.summaryAxes}>
                      {v.axes.map((a) => <span key={a} className={styles.axisTag}>{a}</span>)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.generateBtn} onClick={handleGenerate}>Gerar Gráfico</button>
        </div>
      </div>
    </div>
  );
}

//placeholder estático
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

function LoadingCharts() {
  return (
    <div className={styles.loadingCharts}>
      <div className={styles.spinner} />
      <span>Carregando gráficos…</span>
    </div>
  );
}

//main Page __________________________________________________________________________________________#
export default function ControlChart({ params }) {
  const { group, piece } = params;
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [chartsData, setChartsData] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartError, setChartError] = useState(null);

  //hook print
  const { saveLoading, registerChartRef, triggerSave, currentJobId } =
    useSaveControlChartToJob();

  const handleGenerate = useCallback(async (selections) => {
    setLoadingCharts(true);
    setChartsData(null);
    setChartError(null);
    try {
      const res = await fetch(`${API}/pieces/${group}/${piece}/charts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setChartsData(data.charts);
    } catch (e) {
      setChartError(e.message);
    } finally {
      setLoadingCharts(false);
    }
  }, [group, piece]);

  //agrupa os charts por ponto para saber quantos pontos únicos existem
  const uniquePoints = chartsData
    ? [...new Set(chartsData.filter((c) => !c.error).map((c) => c.point))]
    : [];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>

        {/*toolbar */}
        <div className={styles.toolbar}>
          <button
            onClick={() => router.push(`/analysis/${group}/${piece}`)}
            className={styles.btnMenu}
            title={"Ir para analysis"}
          >
            <Grid3x3 size={30} />
          </button>

          <div className={styles.toolbarRight}>
            {/* Botão de captura — só aparece quando há gráficos */}
            {chartsData && uniquePoints.length > 0 && (
              <button
                className={styles.btnMenu}
                onClick={() => triggerSave(group, piece)}
                disabled={saveLoading}
                title={
                  currentJobId
                    ? `Salvar ${uniquePoints.length} PNG(s) no Job ${currentJobId}`
                    : "Nenhum Job ativo"
                }
              >
                {saveLoading
                  ? "⏳ Salvando…"
                  : <SaveAll size={30} className={styles.btnMenu} />}
              </button>
            )}

            <button className={styles.btnMenu} title="Create Chart" onClick={() => setModalOpen(true)}>
              <Settings size={30} />
            </button>
            <button className={styles.btnMenu} title="Report" >
              <ArrowBigRight size={33} onClick={() => router.push(`/analysis/${group}/${piece}/report-builder`)} />
            </button>
          </div>
        </div>

        {/*conteúdo principal */}
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
                  <SingleChart
                    key={i}
                    chartData={cd}
                    //passa registerChartRef para cada gráfico se registrar pelo ponto+eixo
                    onRef={registerChartRef}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>

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

