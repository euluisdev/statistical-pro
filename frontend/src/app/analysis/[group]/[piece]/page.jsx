"use client";

import { useEffect, useState } from "react";

export default function AnalysisPage({ params }) {
  const { group, piece } = params;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAnalysis() {
    setLoading(true);

    try {
      // gera analysis.csv
      await fetch(
        `http://localhost:8000/pieces/${group}/${piece}/generate_analysis`,
        { method: "POST" }
      );

      // carrega dataframe JSON
      const res = await fetch(
        `http://localhost:8000/pieces/${group}/${piece}/dataframe`
      );

      const json = await res.json();
      setData(json.data ?? []);
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

      {loading && <p>Carregando...</p>}

      {!loading && data.length === 0 && (
        <p>Nenhum dado encontrado. Gere o analysis.csv primeiro.</p>
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
