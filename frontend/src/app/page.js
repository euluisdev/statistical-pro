"use client";

import { useEffect, useState } from "react";

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
    } catch (err) {
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
    } catch (err) {
      setPieces([]);
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      loadPieces(selectedGroup);
    }
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

      if (res.status === 201) {
        const data = await res.json();
        setMsg(`Grupo "${data.created}" criado com sucesso!`);
        setNewGroup("");
        loadGroups();
      } else {
        const err = await res.json();
        setMsg(`Erro: ${err.detail}`);
      }
    } catch (error) {
      setMsg("Erro ao criar grupo.");
    } finally {
      setLoading(false);
    }
  };

  const createPiece = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!selectedGroup) {
      setMsg("Selecione um grupo primeiro!");
      return;
    }

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

      if (res.status === 201) {
        const data = await res.json();
        setMsg(`Peça "${data.created}" criada com sucesso!`);

        //clear inputs
        setPartNumber("");
        setPartName("");
        setModel("");

        // update list
        loadPieces(selectedGroup);
      } else {
        const err = await res.json();
        setMsg(`Erro ao criar peça: ${err.detail}`);
      }
    } catch (error) {
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

      if (res.ok) {
        setMsg(`Peça ${selectedPiece} apagada!`);
        setSelectedPiece("");
        loadPieces(selectedGroup);
      } else {
        const err = await res.json();
        setMsg(`Erro: ${err.detail}`);
      }
    } catch (err) {
      setMsg("Erro ao apagar peça.");
    }
  };

  return (
    <div className="container">
      <h1>Gerenciar Grupos</h1>

      <form onSubmit={createGroup}>
        <input
          type="text"
          placeholder="Nome do grupo"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Grupo"}
        </button>
      </form>

      {msg && <p>{msg}</p>}

      <h1>Cadastro de Peças</h1>

      <label>Escolha um grupo:</label>
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
      >
        <option value="">Selecione...</option>

        {groups.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      {selectedGroup && (
        <>
          <p>Grupo selecionado: {selectedGroup}</p>

          {/* form part */}
          <h3>Cadastrar nova peça</h3>

          <form onSubmit={createPiece}>
            <input
              type="text"
              placeholder="Part Number"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Nome da peça"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Modelo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />

            <button type="submit">Criar Peça</button>
          </form>

          {/*list */}
      {selectedGroup && (
        <>
          <h3>Peças do grupo</h3>

          <select
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

          {selectedPiece && (
            <button onClick={deletePiece}>
              Apagar
            </button>
          )}
        </>
      )}
        </>
      )}
    </div>
  );
}
