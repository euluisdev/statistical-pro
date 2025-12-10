"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Grid3x3, ArrowBigDown, SaveAll, ArrowBigRight, ChartColumnBig } from "lucide-react";
import styles from "./chartcggroup.module.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function GroupReport({ params }) {
  const { group } = params;
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
    return Math.ceil(diff / 604800000);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentJobId(localStorage.getItem("current_jobid"));
    }
  }, []);

  useEffect(() => {
    loadAvailableWeeks();
    loadGroupReport();
  }, [group]);


  //LISTA AS SEMANAS EM QUE EXISTE DADOS DO GRUPO
  async function loadAvailableWeeks() {
    try {
      const res = await fetch(`${API}/groups/${group}/analysis/list`);
      const json = await res.json();
      setAvailableWeeks(json.files || []);
    } catch (err) {
      console.error("Erro ao carregar semanas:", err);
    }
  }


  //CARREGA O REPORT GERAL DO GRUPO
  async function loadGroupReport() {
    try {
      const res = await fetch(`${API}/groups/${group}/report`);
      const json = await res.json();

      if (json.weeks && json.weeks.length > 0) {
        setReportData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
    }
  }


  //GERA ANÁLISE + ESTATÍSTICAS (PARA O GRUPO)
  async function generateReport() {
    setLoading(true);
    try {
      const resGen = await fetch(
        `${API}/groups/${group}/generate_analysis?week=${selectedWeek}&year=${selectedYear}`,
        { method: "POST" }
      );

      if (!resGen.ok) throw new Error("Erro ao gerar análise");

      const resStats = await fetch(
        `${API}/groups/${group}/calculate_statistics?week=${selectedWeek}&year=${selectedYear}`,
        { method: "POST" }
      );

      if (!resStats.ok) throw new Error("Erro ao calcular estatísticas");

      await loadGroupReport();
      await loadAvailableWeeks();

      alert(`✓ Relatório do GRUPO gerado!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar relatório: " + err.message);
    } finally {
      setLoading(false);
    }
  }


  //SALVAR PNG NO JOB
  async function saveChartToJob() {
    if (!currentJobId) {
      alert("⚠️ Nenhum Job ativo!");
      return;
    }
    setShowSaveModal(true);
  }

  async function confirmSaveChart() {
    setSaveLoading(true);

    try {
      const gd = plotRef.current?.el;
      const Plotly = (await import("plotly.js-dist-min")).default;

      const imageData = await Plotly.toImage(gd, {
        format: "png",
        width: 1400,
        height: 800,
        scale: 2
      });

      const response = await fetch(
        `${API}/jobs/job/${currentJobId}/save-chart`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group: group,
            piece: null,
            image_data: imageData
          })
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar no backend");

      const result = await response.json();

      alert(`✓ Gráfico salvo!\n📁 ${result.filename}`);

    } catch (err) {
      console.error(err);
      alert(`❌ Erro ao salvar gráfico: ${err.message}`);
    } finally {
      setSaveLoading(false);
      setShowSaveModal(false);
    }
  }

  const chartData =
    reportData && reportData.weeks.length > 0
      ? prepareGroupChartData(reportData, group)
      : null;

  return (
    <div className={styles.pageContainer}>

      {/* MODAL DE SALVAR */}
      {showSaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>💾 Salvar Gráfico no Job</h3>

            <p>
              Deseja salvar o gráfico geral do grupo?<br />
              <strong>Job ID:</strong> {currentJobId}
            </p>

            <div className={styles.modalActions}>
              <button onClick={() => setShowSaveModal(false)}>Cancelar</button>
              <button onClick={confirmSaveChart} disabled={saveLoading}>
                {saveLoading ? "⏳ Salvando..." : "✓ Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          CG Geral - {group} ({reportData?.total_pieces || 0} peças)
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
                <option key={y} value={y}>{y}</option>
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
                <option key={w} value={w}>W {w}</option>
              ))}
            </select>
          </div>

          <div className={styles.menuBtn}>
            <button onClick={generateReport} disabled={loading} className={styles.btnMenu}>
              {loading ? "⏳" : <ArrowBigDown size={33} />}
            </button>

            {chartData && (
              <button
                onClick={saveChartToJob}
                disabled={!currentJobId || saveLoading}
                className={styles.btnMenu}
              >
                <SaveAll size={33} />
              </button>
            )}

            <button
              onClick={() => router.push(`/analysis/${group}`)}
              className={styles.btnMenu}
            >
              <Grid3x3 size={33} />
            </button>
          </div>
        </div>

        {availableWeeks.length > 0 && (
          <div className={styles.historyContainer}>
            <h3>HISTÓRICO - {availableWeeks.length}</h3>
            <div className={styles.historyGrid}>
              {availableWeeks.map((file) => (
                <div key={file.filename} className={styles.historyItem}>
                  <span>{file.year} - W{file.week}</span>
                  <span>{new Date(file.modified).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* GRÁFICO */}
      {chartData ? (
        <div className={styles.chartContainer}>
          <Plot
            ref={plotRef}
            data={chartData.data}
            layout={chartData.layout}
            config={{
              displayModeBar: true,
              displaylogo: false
            }}
            style={{ width: "100%", height: "700px" }}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>Nenhum relatório disponível.</div>
      )}

    </div>
  );
}



function prepareGroupChartData(reportData, group) {
  const { weeks } = reportData;

  const weekLabels = weeks.map((w) => `Week ${w.week}`);

  return {
    data: [
      {
        x: weekLabels,
        y: weeks.map((w) => w.green_percent),
        name: "CG ≤ 75%",
        type: "bar",
        marker: { color: "green" },
        text: weeks.map((w) => w.green),
        textposition: "inside",
        insidetextanchor: "middle"
      },
      {
        x: weekLabels,
        y: weeks.map((w) => w.yellow_percent),
        name: "75% < CG ≤ 100%",
        type: "bar",
        marker: { color: "yellow" },
        text: weeks.map((w) => w.yellow),
        textposition: "inside",
        insidetextanchor: "middle"
      },
      {
        x: weekLabels,
        y: weeks.map((w) => w.red_percent),
        name: "CG > 100%",
        type: "bar",
        marker: { color: "red" },
        text: weeks.map((w) => w.red),
        textposition: "inside",
        insidetextanchor: "middle"
      }
    ],
    layout: {
      barmode: "stack",
      title: `CG Geral - ${group}`,
      xaxis: { tickangle: -45 },
      yaxis: {
        ticksuffix: "%",
        range: [0, 100]
      },
      legend: {
        orientation: "h",
        y: -0.15
      },
      margin: { l: 60, r: 40, t: 60, b: 130 }
    }
  };
}
