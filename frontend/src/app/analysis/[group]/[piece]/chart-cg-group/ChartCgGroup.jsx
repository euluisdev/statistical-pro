"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./chartcggroup.module.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ReportGroupClient({ params }) {
  const { group } = params;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [piecesList, setPiecesList] = useState([]);
  const [loading, setLoading] = useState(false);

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }

  useEffect(() => {
    loadGroupReport();
  }, [group]);

  async function loadGroupReport() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/pieces/group/${group}/report`);
      const json = await res.json();
      
      if (json.weeks && json.weeks.length > 0) {
        setReportData(json.weeks);
        setPiecesList(json.pieces || []);
      }
    } catch (err) {
      console.error("Erro ao carregar relatório do grupo:", err);
    } finally {
      setLoading(false);
    }
  }

  async function generateAllPiecesReports() {
    setLoading(true);

    try {
      // Pega lista de peças
      const resPieces = await fetch(`${API}/pieces/${group}`);
      const pieces = await resPieces.json();

      if (!pieces || pieces.length === 0) {
        alert("Nenhuma peça encontrada no grupo");
        return;
      }

      let generated = 0;
      const currentWeek = getCurrentWeek();

      // Para cada peça, gera análise da semana atual
      for (const piece of pieces) {
        try {
          // Gera análise
          await fetch(
            `${API}/pieces/${group}/${piece.part_number}/generate_analysis?week=${currentWeek}&year=${selectedYear}`,
            { method: "POST" }
          );

          // Calcula estatísticas
          await fetch(
            `${API}/pieces/${group}/${piece.part_number}/calculate_statistics?week=${currentWeek}&year=${selectedYear}`,
            { method: "POST" }
          );

          generated++;
        } catch (err) {
          console.error(`Erro na peça ${piece.part_number}:`, err);
        }
      }

      // Recarrega relatório do grupo
      await loadGroupReport();

      alert(`✓ ${generated} peças processadas para semana ${currentWeek}/${selectedYear}!`);
    } catch (err) {
      console.error("Erro ao gerar relatórios:", err);
      alert("Erro ao gerar relatórios");
    } finally {
      setLoading(false);
    }
  }

  const chartData = reportData && reportData.length > 0
    ? prepareChartData(reportData, group, piecesList.length)
    : null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          CG Geral - {group} - ({piecesList.length} Peças)
        </h1>

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label>Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={styles.select}
            >
              {[2023, 2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateAllPiecesReports}
            disabled={loading}
            className={styles.btnGenerate}
          >
            {loading ? "⏳ Processando..." : "📊 Gerar Semana Atual (Todas Peças)"}
          </button>

          <button
            onClick={() => window.history.back()}
            className={styles.btnBack}
          >
            ← Voltar
          </button>
        </div>

        {piecesList.length > 0 && (
          <div className={styles.piecesInfo}>
            <p className={styles.piecesLabel}>
              Peças: {piecesList.join(", ")}
            </p>
          </div>
        )}
      </div>

      {chartData ? (
        <div className={styles.chartContainer}>
          <Plot
            data={chartData.data}
            layout={chartData.layout}
            config={{
              displayModeBar: true,
              displaylogo: false,
              toImageButtonOptions: {
                format: "png",
                filename: `CG_Geral_${group}_${selectedYear}`,
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
              ? "Processando todas as peças..."
              : "Nenhum relatório gerado ainda. Clique em 'Gerar Semana Atual' para processar todas as peças do grupo"}
          </p>
        </div>
      )}
    </div>
  );
}

function prepareChartData(weeksData, group, piecesCount) {
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
        marker: { color: "#4ade80" },
        text: greenValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Verde: %{text} pontos (%{y:.1f}%)<extra></extra>",
      },
      {
        x: weekLabels,
        y: yellowData,
        name: "75% < CG ≤ 100%",
        type: "bar",
        marker: { color: "#fbbf24" },
        text: yellowValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Amarelo: %{text} pontos (%{y:.1f}%)<extra></extra>",
      },
      {
        x: weekLabels,
        y: redData,
        name: "CG > 100%",
        type: "bar",
        marker: { color: "#ef4444" },
        text: redValues,
        textposition: "inside",
        textfont: { color: "white", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Vermelho: %{text} pontos (%{y:.1f}%)<extra></extra>",
      },
    ],
    layout: {
      barmode: "stack",
      title: {
        text: `CG Geral - ${group} - (${piecesCount} Peças)`,
        font: { size: 22, weight: "bold", color: "#2d3748" },
      },
      xaxis: {
        title: "",
        tickangle: -45,
        tickfont: { size: 11 },
        gridcolor: "#e2e8f0",
      },
      yaxis: {
        title: "",
        range: [0, 100],
        ticksuffix: "%",
        tickfont: { size: 12 },
        gridcolor: "#e2e8f0",
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