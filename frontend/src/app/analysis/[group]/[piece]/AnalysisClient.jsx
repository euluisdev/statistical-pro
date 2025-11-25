"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./analysis.module.css";
import summaryStyles from "./summary.module.css";

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


  const cpGte133 = statistics?.characteristics.filter(c => c.cp >= 1.33).length || 0;
  const cpkGte133 = statistics?.characteristics.filter(c => c.cpk >= 1.33).length || 0;
  const cp1to133 = statistics?.characteristics.filter(c => c.cp >= 1.0 && c.cp < 1.33).length || 0;
  const cpk1to133 = statistics?.characteristics.filter(c => c.cpk >= 1.0 && c.cpk < 1.33).length || 0;
  const cpLt1 = statistics?.characteristics.filter(c => c.cp < 1.0).length || 0;
  const cpkLt1 = statistics?.characteristics.filter(c => c.cpk < 1.0).length || 0;
  const cg76to100 = statistics?.characteristics.filter(c => c.classification === "1 ≤ CP < 1.33").length || 0;
  const total = statistics?.summary.total_characteristics || 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/*header*/}
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
                {[2025, 2026, 2027, 2028].map(y => (
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
              {!isProcessing && "Carregar Dados"}
            </button>
          </div>

          {/*history*/}
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
          <div className={summaryStyles.summaryCard}>
            {/* LINHA 1 - TOTAL */}
            <div className={`${summaryStyles.summaryRow} ${summaryStyles.totalRow}`}>
              <div className={`${summaryStyles.cell} ${summaryStyles.bgGray}`}>
                <span className={summaryStyles.label}>TOTAL</span>
              </div>
              
              <div className={`${summaryStyles.cell} ${summaryStyles.bgGray}`}>
                <span className={summaryStyles.value}>{statistics.total_measurements}</span>
              </div>
              
              <div className={`${summaryStyles.cell} ${summaryStyles.bgGray}`}>
                {showPercentage && (
                  <span className={summaryStyles.value}>100,00%</span>
                )}
              </div>
            </div>

{/* LINHA 2 - CG (LARANJA) */}
<div className={`${summaryStyles.summaryRow} ${summaryStyles.cgRow}`}>
  <div className={`${summaryStyles.cell} ${summaryStyles.bgOrange}`}>
    <span className={summaryStyles.label}>CG</span>
  </div>
  
  <div className={`${summaryStyles.cell} ${summaryStyles.cellHorizontal} ${summaryStyles.bgOrange}`}>
    <span className={summaryStyles.value}>{statistics.summary.cg_green}</span>
    {showPercentage && (
      <span className={summaryStyles.value}>{statistics.summary.cg_green_percent}%</span>
    )}
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgOrange}`}>
    <span className={summaryStyles.label}>CP</span>
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgOrange}`}>
    <span className={summaryStyles.label}>QH</span>
    <span className={summaryStyles.valueMedium}>{total}</span>
    {showPercentage && (
      <span className={summaryStyles.subvalue}>100,00%</span>
    )}
  </div>

    <div className={`${summaryStyles.cell} ${summaryStyles.bgOrange}`}>
      <span className={summaryStyles.label}>CPK</span>
    </div>

    <div className={`${summaryStyles.cell} ${summaryStyles.bgOrange}`}>
      <span className={summaryStyles.label}>QH</span>
      <span className={summaryStyles.valueMedium}>{total}</span>
      {showPercentage && (
        <span className={summaryStyles.subvalue}>100,00%</span>
      )}
    </div>
  </div>

{/* LINHA 3 - CG ≤ 75% (VERDE) */}
<div className={`${summaryStyles.summaryRow} ${summaryStyles.detailRow}`}>
  <div className={`${summaryStyles.cell} ${summaryStyles.bgGreen}`}>
    <span className={`${summaryStyles.label} ${summaryStyles.labelSmall}`}>CG ≤ 75%</span>
  </div>
  
  <div className={`${summaryStyles.cell} ${summaryStyles.cellHorizontal} ${summaryStyles.bgGreen}`}>
    <span className={summaryStyles.value}>{statistics.summary.cg_yellow}</span>
    {showPercentage && (
      <span className={summaryStyles.value}>{statistics.summary.cg_yellow_percent}%</span>
    )}
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgGreen}`}>
    <span className={summaryStyles.label}>CP ≥ 1,33</span>
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgGreen}`}>
    <span className={summaryStyles.valueMedium}>{statistics.summary.cp_green}</span>
    {showPercentage && (
      <span className={summaryStyles.subvalue}>{statistics.summary.cp_green_percent}%</span>
    )}
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgGreen}`}>
    <span className={summaryStyles.label}>CPK ≥ 1,33</span>
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgGreen}`}>
    <span className={summaryStyles.valueMedium}>{statistics.summary.cpk_green}</span>
    {showPercentage && (
      <span className={summaryStyles.subvalue}>{statistics.summary.cpk_green_percent}%</span>
    )}
  </div>
</div>

{/* LINHA 4 - 75% < CG ≤ 100% (AMARELO) */}
<div className={`${summaryStyles.summaryRow} ${summaryStyles.detailRow}`}>
  <div className={`${summaryStyles.cell} ${summaryStyles.bgYellow}`}>
    <span className={`${summaryStyles.label} ${summaryStyles.labelSmall}`}>75% &lt; CG ≤ 100%</span>
  </div>
  
  <div className={`${summaryStyles.cell} ${summaryStyles.cellHorizontal} ${summaryStyles.bgYellow}`}>
    <span className={summaryStyles.value}>{statistics.summary.cg_yellow}</span>
    {showPercentage && (
      <span className={summaryStyles.value}>{statistics.summary.cg_yellow_percent}%</span>
    )}
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgYellow}`}>
    <span className={summaryStyles.label}>1 ≤ CP &lt; 1,33</span>
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgYellow}`}>
    <span className={summaryStyles.valueMedium}>{statistics.summary.cp_yellow}</span>
    {showPercentage && (
      <span className={summaryStyles.subvalue}>{statistics.summary.cp_yellow_percent}%</span>
    )}
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgYellow}`}>
    <span className={summaryStyles.label}>1 ≤ CPK &lt; 1,33</span>
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgYellow}`}>
    <span className={summaryStyles.valueMedium}>{statistics.summary.cpk_yellow}</span>
    {showPercentage && (
      <span className={summaryStyles.subvalue}>{statistics.summary.cpk_yellow_percent}%</span>
    )}
  </div>
</div>

{/* LINHA 5 - CG < 100% (VERMELHO) */}
<div className={`${summaryStyles.summaryRow} ${summaryStyles.detailRow}`}>
  <div className={`${summaryStyles.cell} ${summaryStyles.bgRed}`}>
    <span className={summaryStyles.label}>CG &lt; 100%</span>
  </div>
  
  <div className={`${summaryStyles.cell} ${summaryStyles.cellHorizontal} ${summaryStyles.bgRed}`}>
    <span className={summaryStyles.value}>{statistics.summary.cg_red}</span>
    {showPercentage && (
      <span className={summaryStyles.value}>{statistics.summary.cg_red_percent}%</span>
    )}
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgRed}`}>
    <span className={summaryStyles.label}>CP &lt; 1</span>
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgRed}`}>
    <span className={summaryStyles.valueMedium}>{statistics.summary.cp_red}</span>
    {showPercentage && (
      <span className={summaryStyles.subvalue}>{statistics.summary.cp_red_percent}%</span>
    )}
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgRed}`}>
    <span className={summaryStyles.label}>CPK &lt; 1</span>
  </div>

  <div className={`${summaryStyles.cell} ${summaryStyles.bgRed}`}>
    <span className={summaryStyles.valueMedium}>{statistics.summary.cpk_red}</span>
    {showPercentage && (
      <span className={summaryStyles.subvalue}>{statistics.summary.cpk_red_percent}%</span>
    )}
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
                    <tr key={idx}>
                      <td>{char.nome_ponto}</td>
                      <td>{char.eixo}</td>
                      <td>TRUE</td>
                      <td>{char.tol_minus.toFixed(2)}</td> 
                      <td>{char.tol_plus.toFixed(2)}</td> 
                      <td className={getMeanClass(char.mean, char.lsl, char.usl)}>{char.mean.toFixed(3)}</td>
                      <td>{char.range.toFixed(3)}</td>
                      <td>{char.sigma.toFixed(3)}</td>
                      <td className={getCpClass(char.cp)}>{char.cp.toFixed(2)}</td>
                      <td className={getCpkClass(char.cpk)}>{char.cpk.toFixed(2)}</td>
                      <td className={styles.riskColumn}>{char.risk_level}</td>
                      <td>{char.n}</td>
                      <td>{char.min.toFixed(3)}</td>
                      <td>{char.max.toFixed(3)}</td>
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

function getCpClass(cp) {
  if (cp >= 1.33) return styles.green;
  if (cp >= 1.0) return styles.yellow;
  return styles.red;
}

function getCpkClass(cpk) {
  if (cpk >= 1.33) return styles.green;
  if (cpk >= 1.0) return styles.yellow;
  return styles.red;
}

function getMeanClass(mean, lsl, usl) {
  // 1) Fora da tolerância → VERMELHO
  if (mean < lsl || mean > usl) return styles.red;

  // 2) Percentual dentro da tolerância
  const absMean = Math.abs(mean);
  const maxDev = Math.min(Math.abs(lsl), Math.abs(usl)); // referência correta
  const percent = absMean / maxDev;

  if (percent >= 0.8) return styles.yellow;
  return styles.green;
}

