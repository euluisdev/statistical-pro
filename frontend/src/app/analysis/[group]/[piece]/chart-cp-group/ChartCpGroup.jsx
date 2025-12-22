"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowBigDown, SaveAll, Undo2 } from "lucide-react";
import { useSaveChartToJob } from "@/app/hooks/useSaveChartToJob";
import { SaveChartModal } from "@/app/components/common/SaveChartModal";
import ChartCpPieces from "./ChartCpPieces"
import styles from "./chartcpgroup.module.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ReportGroupCpClient({ params }) {
  const { group } = params;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [reportData, setReportData] = useState(null);
  const [piecesList, setPiecesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const plotRef = useRef(null);

  //hook to save chart in the job-id
  const {
    currentJobId,
    showSaveModal,
    saveLoading,
    openSaveModal,
    saveChart,
    closeSaveModal
  } = useSaveChartToJob();

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }

  useEffect(() => {
    loadPiecesList();
    loadGroupReports();
  }, [group]);

  async function loadPiecesList() {
    try {
      const res = await fetch(`${API}/pieces/${group}`);
      const json = await res.json();
      setPiecesList(json || []);
    } catch (err) {
      console.error("Erro ao carregar peças:", err);
    }
  }

  async function loadGroupReports() {
    try {
      const res = await fetch(`${API}/pieces/group/${group}/cp-reports`);
      const json = await res.json();

      if (json.weeks && json.weeks.length > 0) {
        setReportData(json.weeks);
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
    }
  }

  async function generateWeekReport() {
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/pieces/group/${group}/generate-week-cp-report?week=${selectedWeek}&year=${selectedYear}`,
        { method: "POST" }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || "Erro ao gerar relatório");
      }

      alert(`✓ Relatório CP gerado!\nSemana ${selectedWeek}/${selectedYear}\nPeças processadas: ${json.pieces_processed}\n\nVerde: ${json.data.green}\nAmarelo: ${json.data.yellow}\nVermelho: ${json.data.red}`);

      await loadGroupReports();
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      alert("Erro ao gerar relatório: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveChart = async () => {
    await saveChart(plotRef, group, "GROUP", "CPC");
  };

  const chartData = reportData && reportData.length > 0
    ? prepareChartData(reportData, group, piecesList.length)
    : null;

  return (
    <div className={styles.pageContainer}>
      {/*modal save */}
      <SaveChartModal
        show={showSaveModal}
        onClose={closeSaveModal}
        onConfirm={handleSaveChart}
        loading={saveLoading}
        jobId={currentJobId}
        group={group}
        piece={"GROUP"}
        chartType="CPC"
      />

      <div className={styles.header}>
        <h1 className={styles.title}>
          CP Geral - {group} - ({piecesList.length} Peças)
        </h1>

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label>Ano</label>
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

          <button
            onClick={generateWeekReport}
            disabled={loading}
            className={styles.btnMenu}
            title={"Gerar Análise"}
          >
            {loading ? "⏳ Gerando..." : <ArrowBigDown size={33} />}
          </button>

          {chartData && (
            <button
              onClick={openSaveModal}
              disabled={!currentJobId || saveLoading}
              className={styles.btnMenu}
              title={currentJobId ? "Salvar gráfico no Job" : "Nenhum Job ativo"}
            >
              <SaveAll size={33} />
            </button>
          )}

          <button
            onClick={() => window.history.back()}
            className={styles.btnMenu}
            title={"Voltar"}
          >
            <Undo2 size={33} />
          </button>
        </div>

      {reportData && reportData.length > 0 && (
        <div className={styles.historyContainer}>
          <h3>HISTÓRICO ({reportData.length})</h3>
          <div className={styles.historyGrid}>
            {reportData.map((report) => (
              <div key={`${report.year}-${report.week}`} className={styles.historyItem}>
                <span className={styles.historyWeek}>
                  {report.year} - W{report.week}
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
                filename: `CP_Geral_${group}_${selectedYear}`,
                height: 1000,
                width: 1600,
                scale: 4,
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
              ? "Gerando relatório da semana..."
              : "Nenhum relatório gerado ainda. Selecione ano/semana e clique em 'Gerar Semana'"}
          </p>
        </div>
      )}

      {/*chart cp for piece */}
      <ChartCpPieces
        group={group}
        selectedYear={selectedYear}
        selectedWeek={selectedWeek}
      />
    </div>
  );
}

function prepareChartData(reportsData, group, piecesCount) {
  if (!reportsData || reportsData.length === 0) return null;

  const weekLabels = reportsData.map((r) => `Week ${r.week}`);

  const greenData = reportsData.map((r) => r.green_percent);
  const yellowData = reportsData.map((r) => r.yellow_percent);
  const redData = reportsData.map((r) => r.red_percent);

  const greenValues = reportsData.map((r) => r.green);
  const yellowValues = reportsData.map((r) => r.yellow);
  const redValues = reportsData.map((r) => r.red);

  return {
    data: [
      {
        x: weekLabels,
        y: greenData,
        name: "CP ≥ 1,33",
        type: "bar",
        width: 0.2,
        marker: { color: "green" },
        text: greenValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Verde: %{text} pontos (%{y:.1f}%)<extra></extra>",
      },
      {
        x: weekLabels,
        y: yellowData,
        name: "1 ≤ CP < 1,33",
        type: "bar",
        width: 0.2,
        marker: { color: "yellow" },
        text: yellowValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Amarelo: %{text} pontos (%{y:.1f}%)<extra></extra>",
      },
      {
        x: weekLabels,
        y: redData,
        name: "CP < 1",
        type: "bar",
        width: 0.2,
        marker: { color: "red" },
        text: redValues,
        textposition: "inside",
        textfont: { color: "white", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Vermelho: %{text} pontos (%{y:.1f}%)<extra></extra>",
      },
    ],
    layout: {
      barmode: "stack",
      title: {
        text: `CP Geral - ${group} - (${piecesCount} Peças)`,
        font: { size: 22, weight: "bold", color: "black" },
      },
      xaxis: {
        title: "",
        tickangle: -45,
        tickfont: { size: 13, color: "black", weight: "bold"  },
        gridcolor: "#e2e8f0",
      },
      yaxis: {
        title: "",
        range: [0, 100],
        ticksuffix: "%",
        tickfont: { size: 14, color: "black", weight: "bold" }, 
        dtick: 10,
        gridcolor: "#e2e8f0",
      },
      legend: {
        x: 0.5,
        y: -0.15,
        xanchor: "center",
        orientation: "h",
        font: { size: 14, color: "black" },
      },
      margin: { l: 60, r: 40, t: 80, b: 100 },
      paper_bgcolor: "white",
      plot_bgcolor: "#d5d6d6ff",
      hovermode: "x unified",
    },
  };
}