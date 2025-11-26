"use client";

import { useState } from "react";
import { FolderPlus, Trash2 } from "lucide-react";

export default function GroupManager({ groups, onGroupCreated, onGroupDeleted, onGroupSelected, selectedGroup }) {
  const [newGroup, setNewGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const createGroup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroup }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setNewGroup("");
        onGroupCreated(data.created);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const res = await fetch(`${API}/groups/${selectedGroup}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onGroupDeleted();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* CRIAR GRUPO */}
      <div className="card">
        <h2>Novo Grupo</h2>
        <form className="form" onSubmit={createGroup}>
          <input
            className="input-sm"
            type="text"
            placeholder="Nome do grupo"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            required
          />
          <button className="btn-sm btn-success" type="submit" disabled={loading}>
            <FolderPlus size={16} />
          </button>
        </form>
      </div>

      {/* SELECIONAR GRUPO */}
      <div className="card">
        <h2>📁 Grupo</h2>
        <select
          className="input-sm"
          value={selectedGroup}
          onChange={(e) => onGroupSelected(e.target.value)}
        >
          <option value="">Selecione...</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {selectedGroup && (
          <p className="selected-text-sm">
            <b>{selectedGroup}</b>
          </p>
        )}

        <button
          className="btn-sm btn-danger"
          onClick={deleteGroup}
          disabled={!selectedGroup}
          title="Apagar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </>
  );
}
