"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./analysis.module.css";

export default function AnalysisPage() {
  const params = useParams();
  const group = params?.group;
  const piece = params?.piece;
  
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPercentage, setShowPercentage] = useState(true);

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }

  async function loadAvailableFiles() {
    if (!group || !piece) return;
    
    try {
      const res = await fetch(
        `http://localhost:8000/pieces/${group}/${piece}/analysis/list`
      );
      const json = await res.json();
      setAvailableFiles(json.files || []);
    } catch (err) {
      console.error("Erro ao listar arquivos:", err);
    }
  }

  async function generateAndCalculate() {
    if (!group || !piece) return;
    
    setGenerating(true);
    try {
      // 1. Gera o analysis.csv
      const resGen = await fetch(
        `http://localhost:8000/pieces/${group}/${piece}/generate_analysis?week=${selectedWeek}&year=${selectedYear}`,
        { method: "POST" }
      );

      if (!resGen.ok) throw new Error("Erro ao gerar análise");

      // 2. Calcula as estatísticas
      setCalculating(true);
      const resCalc = await fetch(
        `http://localhost:8000/pieces/${group}/${piece}/calculate_statistics?week=${selectedWeek}&year=${selectedYear}`,
        { method: "POST" }
      );

      if (!resCalc.ok) throw new Error("Erro ao calcular estatísticas");

      const json = await resCalc.json();
      setStatistics(json.statistics);
      
      await loadAvailableFiles();
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao processar análise: " + err.message);
    } finally {
      setGenerating(false);
      setCalculating(false);
    }
  }

  useEffect(() => {
    if (group && piece) {
      loadAvailableFiles();
    }
  }, [group, piece]);

  if (!group || !piece) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Carregando parâmetros...</p>
      </div>
    );
  }

  const isProcessing = generating || calculating;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>
              Análise Estatística – {group} / {piece}
            </h1>
            
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="showPercentage"
                checked={showPercentage}
                onChange={(e) => setShowPercentage(e.target.checked)}
              />
              <label htmlFor="showPercentage">Mostrar Percentual Total</label>
            </div>
          </div>

          {/* FILTROS */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={styles.filterSelect}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Semana</label>
              <input
                type="number"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                min="1"
                max="53"
                className={styles.filterInput}
              />
            </div>

            <button
              onClick={generateAndCalculate}
              disabled={isProcessing}
              className={styles.btnPrimary}
            >
              {generating && "⏳ Gerando..."}
              {calculating && "📊 Calculando..."}
              {!isProcessing && "🚀 Carregar Dados"}
            </button>
          </div>

          {/* HISTÓRICO */}
          {availableFiles.length > 0 && (
            <div className={styles.historyContainer}>
              <p className={styles.historyTitle}>📂 Histórico disponível:</p>
              <div className={styles.historyButtons}>
                {availableFiles.map((f) => (
                  <button
                    key={f.filename}
                    onClick={() => {
                      setSelectedYear(f.year);
                      setSelectedWeek(f.week);
                    }}
                    className={`${styles.historyBtn} ${
                      f.year === selectedYear && f.week === selectedWeek
                        ? styles.active
                        : ''
                    }`}
                  >
                    {f.year} - S{f.week}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RESUMO */}
        {statistics && statistics.summary && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>TOTAL</div>
                <div className={styles.summaryValue}>{statistics.total_measurements}</div>
                <div className={styles.summarySubvalue}>
                  {showPercentage && `${statistics.summary.overall_ok_percent}%`}
                </div>
              </div>
              
              <div className={`${styles.summaryItem} ${styles.highlight}`}>
                <div className={styles.summaryLabel}>CG</div>
                <div className={styles.summaryValue}>{statistics.summary.cg_count}</div>
                <div className={styles.summarySubvalue}>{statistics.summary.cg_percent}%</div>
              </div>
              
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>CP</div>
                <div className={styles.summaryValue}>{statistics.summary.avg_cp}</div>
              </div>
              
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>CPK</div>
                <div className={styles.summaryValue}>{statistics.summary.avg_cpk}</div>
              </div>
              
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>OH</div>
                <div className={styles.summaryValue}>
                  {statistics.summary.total_characteristics}
                </div>
                {showPercentage && (
                  <div className={styles.summarySubvalue}>100%</div>
                )}
              </div>
              
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>PU</div>
                <div className={styles.summaryValue}>0,30%</div>
              </div>
            </div>
          </div>
        )}

        {/* TABELA */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Ponto</th>
                  <th>AX</th>
                  <th>CALC</th>
                  <th>LIE</th>
                  <th>LSE</th>
                  <th>Média</th>
                  <th>Range</th>
                  <th>Sigma</th>
                  <th>CP</th>
                  <th>CPK</th>
                  <th className={styles.riskColumn}>RISK</th>
                  <th>N</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Std</th>
                  <th>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {!statistics || !statistics.characteristics ? (
                  <tr>
                    <td colSpan="16" style={{textAlign: 'center', padding: '2rem', color: '#718096'}}>
                      Nenhum dado carregado. Clique em "Carregar Dados" para processar.
                    </td>
                  </tr>
                ) : (
                  statistics.characteristics.map((char, idx) => (
                    <tr key={idx} className={getRowClass(char.cpk, char.cp)}>
                      <td>{char.nome_ponto}</td>
                      <td>{char.eixo}</td>
                      <td>TRUE</td>
                      <td>{char.lsl.toFixed(2)}</td>
                      <td>{char.usl.toFixed(2)}</td>
                      <td className={styles.cellValue}>{char.mean.toFixed(3)}</td>
                      <td>{char.range.toFixed(2)}</td>
                      <td>{char.sigma.toFixed(2)}</td>
                      <td className={styles.cellValue}>{char.cp.toFixed(2)}</td>
                      <td className={styles.cellValue}>{char.cpk.toFixed(2)}</td>
                      <td className={styles.riskColumn}>{char.risk_level}</td>
                      <td>{char.n}</td>
                      <td>{char.min.toFixed(3)}</td>
                      <td>{char.max.toFixed(3)}</td>
                      <td>{char.std.toFixed(3)}</td>
                      <td>{char.nominal.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESTADO VAZIO */}
        {!statistics && !isProcessing && (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>📊</div>
            <h3 className={styles.emptyTitle}>Pronto para começar!</h3>
            <p className={styles.emptyText}>
              Selecione o ano e semana desejados e clique em "Carregar Dados" para gerar a análise estatística.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getRowClass(cpk, cp) {
  if (cpk < 1.0) return styles.rowRed;
  if (cpk < 1.33) return styles.rowYellow;
  if (cp >= 1.33 && cpk >= 1.67) return styles.rowGreen;
  if (cpk >= 1.33) return styles.rowGreenLight;
  return styles.rowOrange;
}