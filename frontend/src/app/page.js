"use client";

import { useEffect, useState } from "react";
import "./styles.css";

export default function GroupsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [partName, setPartName] = useState("");
  const [model, setModel] = useState("");

  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState("");

  const loadGroups = async () => {
    try {
      const res = await fetch(`${API}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch {
      setMsg("Erro ao carregar grupos.");
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const loadPieces = async (group) => {
    try {
      const res = await fetch(`${API}/pieces/${group}`);
      const data = await res.json();
      setPieces(data);
    } catch {
      setPieces([]);
    }
  };

  useEffect(() => {
    if (selectedGroup) loadPieces(selectedGroup);
  }, [selectedGroup]);

  const createGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`${API}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroup }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMsg(`Grupo "${data.created}" criado com sucesso!`);
        setNewGroup("");
        loadGroups();
      } else {
        setMsg(`Erro: ${data.detail}`);
      }
    } catch {
      setMsg("Erro ao criar grupo.");
    } finally {
      setLoading(false);
    }
  };

  const createPiece = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch(`${API}/pieces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: selectedGroup,
          part_number: partNumber,
          part_name: partName,
          model: model,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMsg(`Peça "${data.created}" criada!`);
        setPartNumber("");
        setPartName("");
        setModel("");
        loadPieces(selectedGroup);
      } else {
        setMsg(`Erro: ${data.detail}`);
      }
    } catch {
      setMsg("Erro ao criar peça.");
    }
  };

  const deletePiece = async () => {
    if (!selectedGroup || !selectedPiece) return;

    try {
      const res = await fetch(
        `${API}/pieces/${selectedGroup}/${selectedPiece}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (res.ok) {
        setMsg(`Peça ${selectedPiece} apagada!`);
        setSelectedPiece("");
        loadPieces(selectedGroup);
      } else {
        setMsg(`Erro: ${data.detail}`);
      }
    } catch {
      setMsg("Erro ao apagar peça.");
    }
  };

  return (
    <div className="page-container">
      <h1 className="title">Gerenciamento de Grupos e Peças</h1>

      {msg && <p className="message">{msg}</p>}

      <div className="grid unified-card">

        <div className="card">
          <h2>Novo Grupo</h2>

          <form className="form" onSubmit={createGroup}>
            <input
              className="input"
              type="text"
              placeholder="Nome do grupo"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              required
            />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Grupo"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Selecionar Grupo</h2>

          <select
            className="input"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Selecione...</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {selectedGroup && (
            <p className="selected-text">
              Grupo selecionado: <b>{selectedGroup}</b>
            </p>
          )}
        </div>

        <div className="card">
          <h2>Cadastrar Peça</h2>

          <form className="form" onSubmit={createPiece}>
            <input
              className="input"
              type="text"
              placeholder="Part Number"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              required
            />

            <input
              className="input"
              type="text"
              placeholder="Nome da peça"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              required
            />

            <input
              className="input"
              type="text"
              placeholder="Modelo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />

            <button className="btn" type="submit">Criar Peça</button>
          </form>
        </div>

        <div className="card">
          <h2>Peças do Grupo</h2>

          <select
            className="input"
            value={selectedPiece}
            onChange={(e) => setSelectedPiece(e.target.value)}
          >
            <option value="">Selecione uma peça...</option>

            {pieces.map((p) => (
              <option key={p.part_number} value={p.part_number}>
                {p.part_number}
              </option>
            ))}
          </select>

          <button
            className="btn-danger"
            onClick={deletePiece}
            disabled={!selectedPiece}
          >
            Apagar Peça
          </button>
        </div>

      </div>
    </div>
  );
}
