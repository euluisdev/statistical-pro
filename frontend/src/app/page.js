"use client";

import { useEffect, useState } from "react";

export default function GroupsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  //list groups
  const loadGroups = async () => {
    try {
      const res = await fetch(`${API}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setMsg("Erro ao carregar grupos.");
    }
  };

  //load init
  useEffect(() => {
    loadGroups();
  }, []);

  //create group
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
        loadGroups(); // reload
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

  return (
    <div className = "container">
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

      {/*msg */}
      {msg && <p>{msg}</p>}

      <h2>Grupos existentes</h2>
      <ul>
        {groups.map((group) => (
          <li key={group}>
            {group}
          </li>
        ))}
      </ul>
    </div>
  );
}