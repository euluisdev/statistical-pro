"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Grid3x3, ArrowBigDown, SaveAll, ArrowBigRight, ChartColumnBig } from "lucide-react";
import styles from "./chartcg.module.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ReportClient({ params }) {
  const { group, piece } = params;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const plotRef = useRef(null);
  const router = useRouter();

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }

  useEffect(() => {
    // Carrega o job_id ativo do localStorage
    if (typeof window !== "undefined") {
      const storedJobId = localStorage.getItem("current_jobid");
      setCurrentJobId(storedJobId);
    }
  }, []);

  useEffect(() => {
    loadAvailableWeeks();
    loadAllReports();
  }, [group, piece]);

  async function loadAvailableWeeks() {
    try {
      const res = await fetch(`${API}/pieces/${group}/${piece}/analysis/list`);
      const json = await res.json();
      setAvailableWeeks(json.files || []);
    } catch (err) {
      console.error("Erro ao carregar semanas:", err);
    }
  }

  async function loadAllReports() {
    try {
      const res = await fetch(`${API}/pieces/${group}/${piece}/report`);
      const json = await res.json();

      if (json.weeks && json.weeks.length > 0) {
        setReportData(json.weeks);
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
    }
  }

  async function generateReport() {
    setLoading(true);

    try {
      const resGen = await fetch(
        `${API}/pieces/${group}/${piece}/generate_analysis?week=${selectedWeek}&year=${selectedYear}`,
        { method: "POST" }
      );

      if (!resGen.ok) {
        throw new Error("Erro ao gerar análise");
      }

      const resStats = await fetch(
        `${API}/pieces/${group}/${piece}/calculate_statistics?week=${selectedWeek}&year=${selectedYear}`,
        { method: "POST" }
      );

      if (!resStats.ok) {
        throw new Error("Erro ao calcular estatísticas");
      }

      await loadAllReports();
      await loadAvailableWeeks();

      alert(`✓ Relatório da semana ${selectedWeek}/${selectedYear} gerado!`);
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      alert("Erro ao gerar relatório: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveChartToJob() {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo! Crie um Job na página inicial primeiro.");
      return;
    }

    setShowSaveModal(true);
  }

  async function confirmSaveChart() {
    setSaveLoading(true);

    try {
      const gd = plotRef.current?.el;

      if (!gd) {
        throw new Error("Gráfico não encontrado");
      }

      //import Plotly dinamicamente
      const Plotly = (await import("plotly.js-dist-min")).default;

      //export png usando plotly.toImage
      const imageData = await Plotly.toImage(gd, {
        format: "png",
        width: 1400,
        height: 800,
        scale: 2
      });

      console.log("Enviando imagem para o backend...");
      console.log("JobID:", currentJobId);
      console.log("Group:", group);
      console.log("Piece:", piece);

      //send to the backend
      const response = await fetch(
        `${API}/jobs/job/${currentJobId}/save-chart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group: group,
            piece: piece,
            image_data: imageData
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro do servidor:", errorText);
        throw new Error(`Erro ao salvar gráfico: ${response.status}`);
      }

      const result = await response.json();
      console.log("Resultado:", result);

      alert(`✓ Gráfico salvo com sucesso!\n📁 ${result.filename}`);

    } catch (err) {
      console.error("Erro ao salvar gráfico:", err);
      alert(`❌ Erro ao salvar gráfico: ${err.message}`);
    } finally {
      setSaveLoading(false);
      setShowSaveModal(false);
    }
  }

  const chartData = reportData && reportData.length > 0
    ? prepareChartData(reportData, piece, group)
    : null;

  return (
    <div className={styles.pageContainer}>
      {/*modal*/}
      {showSaveModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginBottom: "1rem", color: "#2d3748" }}>
              💾 Salvar Gráfico no Job
            </h3>

            <p style={{ marginBottom: "1.5rem", color: "#4a5568", lineHeight: "1.6" }}>
              Deseja salvar este gráfico no Job atual?<br />
              <strong>Job ID:</strong> <code style={{
                backgroundColor: "#edf2f7",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.9em"
              }}>{currentJobId}</code><br />
              <strong>Grupo:</strong> {group}<br />
              <strong>Peça:</strong> {piece}
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowSaveModal(false)}
                disabled={saveLoading}
                style={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                  backgroundColor: "white",
                  color: "#4a5568",
                  cursor: saveLoading ? "not-allowed" : "pointer",
                  fontSize: "0.95rem"
                }}
              >
                Cancelar
              </button>

              <button
                onClick={confirmSaveChart}
                disabled={saveLoading}
                style={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: saveLoading ? "#a0aec0" : "#48bb78",
                  color: "white",
                  cursor: saveLoading ? "not-allowed" : "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "500"
                }}
              >
                {saveLoading ? "⏳ Salvando..." : "✓ Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>
          CG - {group} - {piece}
        </h1>

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label>YEAR</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={styles.select}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>WEEK</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className={styles.select}
            >
              {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  W {w}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.menuBtn}>
            <button
              onClick={generateReport}
              disabled={loading}
              className={styles.btnMenu}
              title="Gerar relatório da semana"
            >
              {loading ? "⏳ Gerando..." : <ArrowBigDown size={33} />}
            </button>

            {chartData && (
              <button
                onClick={saveChartToJob}
                disabled={!currentJobId || saveLoading}
                className={styles.btnMenu}
                title={currentJobId ? "Salvar gráfico no Job" : "Nenhum Job ativo"}
              >
                <SaveAll size={33} />
              </button>
            )}

            <button
              onClick={() => router.push(`/analysis/${group}/${piece}`)}
              className={styles.btnMenu}
              title={"Ir para analysis"}
            >
              <Grid3x3 size={33} />
            </button>
            <button className={styles.btnMenu} title="Cp/Cpk" >
              <ChartColumnBig size={33} onClick={() => router.push(`/analysis/${group}/${piece}/chart-cp-cpk`)} />
            </button>

            <button className={styles.btnMenu} title="Report" >
              <ArrowBigRight size={33} onClick={() => router.push(`/analysis/${group}/${piece}/report-builder`)} />
            </button>
          </div>
        </div>

        {availableWeeks.length > 0 && (
          <div className={styles.historyContainer}>
            <h3>HISTÓRICO - {availableWeeks.length}</h3>
            <div className={styles.historyGrid}>
              {availableWeeks.map((file) => (
                <div
                  key={file.filename}
                  className={styles.historyItem}
                >
                  <span className={styles.historyWeek}>
                    {file.year} - W{file.week}
                  </span>
                  <span className={styles.historyDate}>
                    {new Date(file.modified).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {chartData ? (
        <div className={styles.chartContainer}>
          <Plot
            ref={plotRef}
            data={chartData.data}
            layout={chartData.layout}
            config={{
              displayModeBar: true,
              displaylogo: false,
              toImageButtonOptions: {
                format: "png",
                filename: `CG_${piece}_${selectedYear}`,
                height: 800,
                width: 1400,
                scale: 2,
              },
              modeBarButtonsToAdd: ["toImage"],
            }}
            style={{ width: "100%", height: "700px" }}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span style={{ fontSize: "4rem" }}>📊</span>
          <p>
            {loading
              ? "Gerando relatório..."
              : "Nenhum relatório gerado ainda. Selecione semana/ano e clique em 'Gerar Semana'"}
          </p>
        </div>
      )}
    </div>
  );
}

function prepareChartData(weeksData, piece, group) {
  if (!weeksData || weeksData.length === 0) return null;

  const weekLabels = weeksData.map((w) => `Week ${w.week}`);
  const greenData = weeksData.map((w) => w.green_percent);
  const yellowData = weeksData.map((w) => w.yellow_percent);
  const redData = weeksData.map((w) => w.red_percent);
  const greenValues = weeksData.map((w) => w.green);
  const yellowValues = weeksData.map((w) => w.yellow);
  const redValues = weeksData.map((w) => w.red);

  return {
    data: [
      {
        x: weekLabels,
        y: greenData,
        name: "CG ≤ 75%",
        type: "bar",
        width: 0.3,
        marker: { color: "green" },
        text: greenValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Verde: %{text} (%{y:.1f}%)<extra></extra>",
      },
      {
        x: weekLabels,
        y: yellowData,
        name: "75% < CG ≤ 100%",
        type: "bar",
        width: 0.3,
        marker: { color: "yellow" },
        text: yellowValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Amarelo: %{text} (%{y:.1f}%)<extra></extra>",
      },
      {
        x: weekLabels,
        y: redData,
        name: "CG > 100%",
        type: "bar",
        width: 0.3,
        marker: { color: "red" },
        text: redValues,
        textposition: "inside",
        textfont: { color: "white", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Vermelho: %{text} (%{y:.1f}%)<extra></extra>",
      },
    ],
    layout: {
      barmode: "stack",
      title: {
        text: `CG - ${group} - ${piece}`,
        font: { size: 22, weight: "bold", color: "#2d3748" },
      },
      xaxis: {
        title: "",
        tickangle: -45,
        tickfont: { size: 11 },
        gridcolor: "#e2e8f0",
        showgrid: false,
      },
      yaxis: {
        title: "",
        range: [0, 100],
        ticksuffix: "%",
        tickfont: { size: 12 },
        gridcolor: "#e2e8f0",
        showgrid: false,
      },
      legend: {
        x: 0.5,
        y: -0.15,
        xanchor: "center",
        orientation: "h",
        font: { size: 13 },
      },
      margin: { l: 60, r: 40, t: 80, b: 120 },
      paper_bgcolor: "white",
      plot_bgcolor: "#f9fafb",
      hovermode: "x unified",
    },
  };
} 
