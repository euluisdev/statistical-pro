"use client";

import { useEffect, useState } from "react";
import GroupManager from "./groups/components/GroupManager";
import PieceManager from "./groups/components/PieceManager";
import TxtManager from "./groups/components/TxtManager";
import "./styles.css";

export default function GroupsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [msg, setMsg] = useState(null);

  const loadGroups = async () => {
    try {
      const res = await fetch(`${API}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setMsg("Erro ao carregar grupos");
    }
  };

  const loadPieces = async (group) => {
    try {
      const res = await fetch(`${API}/pieces/${group}`);
      const data = await res.json();
      setPieces(data);
    } catch (err) {
      setPieces([]);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) loadPieces(selectedGroup);
  }, [selectedGroup]);

  return (
    <div className="page-container">
      <h1 className="title">SIX SIGMA</h1>

      {msg && <p className="message">{msg}</p>}

      <div className="grid">
        <GroupManager
          groups={groups}
          selectedGroup={selectedGroup}
          onGroupCreated={(name) => {
            setMsg(`✓ Grupo "${name}" criado`);
            loadGroups();
          }}
          onGroupDeleted={() => {
            setMsg(`✓ Grupo apagado`);
            setSelectedGroup("");
            setPieces([]);
            loadGroups();
          }}
          onGroupSelected={setSelectedGroup}
        />

        <PieceManager
          selectedGroup={selectedGroup}
          pieces={pieces}
          selectedPiece={selectedPiece}
          onPieceCreated={() => {
            setMsg("✓ Peça criada");
            loadPieces(selectedGroup);
          }}
          onPieceDeleted={() => {
            setMsg("✓ Peça apagada");
            setSelectedPiece("");
            loadPieces(selectedGroup);
          }}
          onPieceSelected={setSelectedPiece}
        />

        <TxtManager
          selectedGroup={selectedGroup}
          selectedPiece={selectedPiece}
          onDataExtracted={(data) => {
            setParsedData(data);
            setMsg(`✓ ${data.length} linhas extraídas`);
          }}
        />
      </div>

      {/* TABELA DE DADOS */}
      {parsedData.length > 0 && (
        <div className="table-container">
          <h2>📊 Dados Extraídos ({parsedData.length} linhas)</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(parsedData[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, i) => (
                  <tr key={i}>
                    {Object.keys(parsedData[0]).map((col) => (
                      <td key={col + i}>{String(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}