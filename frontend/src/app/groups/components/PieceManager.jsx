"use client";

import { useState } from "react";
import { Plus, Trash2, BarChart3, Image as ImageIcon } from "lucide-react";

export default function PieceManager({ 
  selectedGroup, 
  pieces, 
  selectedPiece,
  onPieceCreated, 
  onPieceDeleted,
  onPieceSelected 
}) {
  const [partNumber, setPartNumber] = useState("");
  const [partName, setPartName] = useState("");
  const [model, setModel] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const createPiece = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("group", selectedGroup);
    formData.append("part_number", partNumber);
    formData.append("part_name", partName);
    formData.append("model", model);
    
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(`${API}/pieces`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setPartNumber("");
        setPartName("");
        setModel("");
        setImage(null);
        onPieceCreated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePiece = async () => {
    if (!selectedPiece) return;

    try {
      const res = await fetch(
        `${API}/pieces/${selectedGroup}/${selectedPiece}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        onPieceDeleted();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* CADASTRAR PEÇA */}
      <div className="card">
        <h2>Cadastrar</h2>
        <form className="form" onSubmit={createPiece}>
          <input
            className="input-sm"
            type="text"
            placeholder="Part Number"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            required
          />
          <input
            className="input-sm"
            type="text"
            placeholder="Nome"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            required
          />
          <input
            className="input-sm"
            type="text"
            placeholder="Modelo"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
          
          <label className="file-input-sm">
            <ImageIcon size={14} />
            {image ? image.name.substring(0, 15) : "Imagem"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button className="btn-sm btn-success" type="submit" disabled={loading}>
            <Plus size={16} />
          </button>
        </form>
      </div>

      {/* LISTAR PEÇAS */}
      <div className="card">
        <h2>Peças</h2>
        <select
          className="input-sm"
          value={selectedPiece}
          onChange={(e) => onPieceSelected(e.target.value)}
        >
          <option value="">Selecione...</option>
          {pieces.map((p) => (
            <option key={p.part_number} value={p.part_number}>
              {p.part_number}
            </option>
          ))}
        </select>

        <div className="btn-row">
          <button
            className="btn-sm btn-danger"
            onClick={deletePiece}
            disabled={!selectedPiece}
            title="Apagar"
          >
            <Trash2 size={16} />
          </button>

          <button
            className="btn-sm btn-primary"
            onClick={() => {
              if (selectedGroup && selectedPiece) {
                window.location.href = `/analysis/${selectedGroup}/${selectedPiece}`;
              }
            }}
            disabled={!selectedGroup || !selectedPiece}
            title="Análise"
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
