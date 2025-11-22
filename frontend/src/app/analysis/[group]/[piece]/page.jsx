"use client";

import { useEffect, useState } from "react";
//import "./analysis.css";  

export default function AnalysisPage({ params }) {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const { group, piece } = params;

  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const res = await fetch(
          `${API}/pieces/${group}/${piece}/analysis`
        );

        if (!res.ok) {
          const txt = await res.text();
          setError("Erro ao carregar CSV: " + txt);
          return;
        }

        const json = await res.json(); // backend deve converter CSV → JSON
        setData(json);
      } catch (err) {
        setError("Falha ao conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    };

    loadCSV();
  }, [group, piece]);

  if (loading) return <p>Carregando dados...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data || data.length === 0) return <p>Nenhum dado encontrado.</p>;

  return (
    <div className="analysis-container">
      <h1 className="analysis-title">
        📊 Análise da Peça {piece} — Grupo {group}
      </h1>

      <table className="analysis-table">
        <thead>
          <tr>
            {Object.keys(data[0]).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.entries(row).map(([col, val]) => {
                
                // Cores estilo "PCDMIS"
                let className = "";

                if (col === "CPK") {
                  if (val < 1) className = "cell-red";
                  else if (val < 1.33) className = "cell-yellow";
                  else className = "cell-green";
                }

                if (col === "Desvio") {
                  if (Math.abs(val) > 0.5) className = "cell-red";
                  else if (Math.abs(val) > 0.25) className = "cell-yellow";
                }

                return (
                  <td key={col} className={className}>
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
