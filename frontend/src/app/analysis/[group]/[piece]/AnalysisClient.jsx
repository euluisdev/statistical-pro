"use client";

import { useEffect, useState } from "react";

export default function AnalysisPage({ params }) {
  const { group, piece } = params; 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function generateAnalysis() {
    setGenerating(true);
    try {
      const res = await fetch(
        `http://localhost:8000/pieces/${group}/${piece}/generate_analysis`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error("Erro ao gerar análise");
      }

      alert("analysis.csv gerado com sucesso!");
      await loadAnalysis(); // Recarrega os dados
    } catch (err) {
      console.error("Erro ao gerar:", err);
      alert("Erro ao gerar analysis.csv");
    }
    setGenerating(false);
  }

  async function loadAnalysis() {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/pieces/${group}/${piece}/analysis`
      );

      if (!res.ok) {
        throw new Error("analysis.csv não encontrado");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Erro:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAnalysis();
  }, [group, piece]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">
        Análise – {group} / {piece}
      </h1>

      {/* BOTÃO PARA GERAR O ARQUIVO */}
      <button
        onClick={generateAnalysis}
        disabled={generating}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {generating ? "Gerando..." : "Gerar analysis.csv"}
      </button>

      {loading && <p>Carregando...</p>}

      {!loading && data.length === 0 && (
        <p>Nenhum dado encontrado. Clique em "Gerar analysis.csv" primeiro.</p>
      )}

      {!loading && data.length > 0 && (
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              {Object.keys(data[0]).map((h) => (
                <th key={h} className="border p-1 bg-gray-100">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((v, i) => (
                  <td key={i} className="border p-1">{String(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}