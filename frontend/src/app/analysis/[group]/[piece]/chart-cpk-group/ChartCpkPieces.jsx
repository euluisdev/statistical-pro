"use client";

import { useEffect, useState, forwardRef  } from "react";
import dynamic from "next/dynamic";
import styles from "./chartcpkpieces.module.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const PiecesChartCp = forwardRef(function PiecesChartCp(
  { group, selectedYear, selectedWeek },
  plotRef
) {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [piecesData, setPiecesData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedWeek && selectedYear) {
      loadPiecesReport();
    }
  }, [selectedWeek, selectedYear, group]);

  async function loadPiecesReport() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/pieces/group/${group}/pieces-cpk-report?week=${selectedWeek}&year=${selectedYear}`
      );
      const json = await res.json();

      if (json.pieces && json.pieces.length > 0) {
        setPiecesData(json);
      } else {
        setPiecesData(null);
      }
    } catch (err) {
      console.error("Erro ao carregar relatório de peças:", err);
      setPiecesData(null);
    } finally {
      setLoading(false);
    }
  }

  const chartData = piecesData ? prepareChartData(piecesData, group) : null;
  const topFive = piecesData ? piecesData.pieces.slice(0, 5) : [];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>⏳ Carregando dados das peças...</p>
      </div>
    );
  }

  if (!piecesData || !chartData) {
    return (
      <div className={styles.emptyContainer}>
        <p>📊 Gere o relatório da semana {selectedWeek}/{selectedYear} para visualizar o CPK por peça</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.sectionTitle}>
        CPk Por Peça - {group} - ({piecesData.total_pieces} Peças)
      </h2>

      {/* GRÁFICO */}
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
              filename: `CPK_Por_Peca_${group}_${selectedYear}_W${selectedWeek}`,
              height: 800,
              width: 1400,
              scale: 4,
            },
            modeBarButtonsToAdd: ["toImage"],
          }}
          style={{ width: "100%", height: "600px" }}
        />
      </div>

      {/* TOP FIVE */}
      <div className={styles.topFiveContainer}>
        <h3 className={styles.topFiveTitle}>TOP FIVE - 5 PIORES ITENS</h3>
        <div className={styles.topFiveGrid}>
          {topFive.map((piece, idx) => (
            <div key={piece.part_number} className={styles.topFiveCard}>
              <div className={styles.topFiveRank}>{idx + 1}</div>
              
              <div className={styles.topFiveImage}>
                {piece.image ? (
                  <img
                    src={`${API}/pieces/${group}/${piece.part_number}/imagens`}
                    alt={piece.part_number}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40'%3E🔩%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className={styles.noImage}>🔩</div>
                )}
              </div>

              <div className={styles.topFiveInfo}>
                <p className={styles.topFivePartNumber}>{piece.part_number}</p>
                
                <div className={styles.topFiveValues}>
                  <div className={styles.colorBox} style={{background: 'red'}}>
                    <span className={styles.colorValue}>{piece.red}</span>
                  </div>
                  <div className={styles.colorBox} style={{background: 'yellow'}}>
                    <span className={styles.colorValue}>{piece.yellow}</span>
                  </div>
                  <div className={styles.colorBox} style={{background: 'green'}}>
                    <span className={styles.colorValue}>{piece.green}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

function prepareChartData(piecesReport, group) {
  const pieces = piecesReport.pieces;
  const labels = pieces.map((p) => p.part_number);

  const greenData = pieces.map((p) => p.green_percent);
  const yellowData = pieces.map((p) => p.yellow_percent);
  const redData = pieces.map((p) => p.red_percent);

  const greenValues = pieces.map((p) => p.green);
  const yellowValues = pieces.map((p) => p.yellow);
  const redValues = pieces.map((p) => p.red);

  return {
    data: [
      {
        x: labels,
        y: greenData,
        name: "CPK ≥ 1,33",
        type: "bar", 
        width: 0.2,
        marker: { color: "green" },
        text: greenValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Verde: %{text} (%{y:.1f}%)<extra></extra>",
      },
      {
        x: labels,
        y: yellowData,
        name: "1 ≤ CPK < 1,33",
        type: "bar", 
        width: 0.2,
        marker: { color: "yellow" },
        text: yellowValues,
        textposition: "inside",
        textfont: { color: "black", size: 14, weight: "bold" },
        hovertemplate: "<b>%{x}</b><br>Amarelo: %{text} (%{y:.1f}%)<extra></extra>",
      },
      {
        x: labels,
        y: redData,
        name: "CPK < 1",
        type: "bar", 
        width: 0.2,
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
        text: `CPK Por Peça - ${group} - (${pieces.length} Peças)`,
        font: { size: 22, weight: "bold", color: "#2d3748" },
      },
      xaxis: {
        title: "",
        tickangle: 0, 
        type: "category",
        tickfont: { size: 10 }, 
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
      margin: { l: 60, r: 40, t: 80, b: 150 },
      paper_bgcolor: "white",
      plot_bgcolor: "#f9fafb",
      hovermode: "x unified",
    },
  };
}

export default PiecesChartCp;
 
 