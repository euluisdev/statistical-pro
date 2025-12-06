"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Grid3x3, Image as ImageIcon } from "lucide-react";

import ConfirmModal from "@/app/components/common/ConfirmModal";

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
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [showCreatePieceModal, setShowCreatePieceModal] = useState(false);
  const [showDeletePieceModal, setShowDeletePieceModal] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();

  useEffect(() => {
    setPreviewImageUrl(`${API}/pieces/${selectedGroup}/${selectedPiece}/imagens`);
  }, [selectedGroup, selectedPiece]);


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
      {/*register part */}
      <div className="card">
        <h2>Cadastrar</h2>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!partNumber || !partName || !model) return;
            setShowCreatePieceModal(true);
          }}
        >

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

      {/*list parts*/}
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

        <div className="piece-row">
          <div className="btn-column">
            <button
              className="btn-small"
              title="Apagar peça"
              disabled={!selectedPiece}
              onClick={() => setShowDeletePieceModal(true)}
            >
              <Trash2 size={24} />
            </button>

            <button
              className="btn-small"
              title="Ir para Análise"
              disabled={!selectedGroup || !selectedPiece}
              onClick={() => {
                router.push(`/analysis/${selectedGroup}/${selectedPiece}`);
              }}
            >
              <Grid3x3 size={24} />
            </button>
          </div>


          <div className="img-wrapper">
            {previewImageUrl ? (
              <img src={previewImageUrl} alt="Preview" className="preview-img" />
            ) : (
              <div className="placeholder">
                Selecione uma peça para visualizar a imagem
              </div>
            )}
          </div>

        </div>


      </div>

      <ConfirmModal
        isOpen={showCreatePieceModal}
        title="Criar peça?"
        message={`Criar peça ${partNumber}?`}
        onCancel={() => setShowCreatePieceModal(false)}
        onConfirm={async () => {
          await createPiece(new Event("submit"));
          setShowCreatePieceModal(false);
        }}
      />

      <ConfirmModal
        isOpen={showDeletePieceModal}
        title="Apagar peça?"
        message={`Deseja apagar a peça ${selectedPiece}?`}
        onCancel={() => setShowDeletePieceModal(false)}
        onConfirm={async () => {
          await deletePiece();
          setShowDeletePieceModal(false);
        }}
      />

    </>
  );
} 
