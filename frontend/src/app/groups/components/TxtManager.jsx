"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, RefreshCw } from "lucide-react";

export default function TxtManager({ selectedGroup, selectedPiece, onDataExtracted }) {
  const [txtFiles, setTxtFiles] = useState([]);
  const [txtList, setTxtList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (selectedPiece && selectedGroup) {
      loadTxtList();
    } else {
      setTxtList([]);
    }
  }, [selectedPiece, selectedGroup]);

  const loadTxtList = async () => {
    if (!selectedGroup || !selectedPiece) return;

    try {
      const res = await fetch(`${API}/pieces/${selectedGroup}/${selectedPiece}/txt`);
      const data = await res.json();
      if (res.ok) {
        setTxtList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uploadTxt = async () => {
    if (txtFiles.length === 0) return;

    const form = new FormData();
    form.append("group", selectedGroup);
    form.append("piece", selectedPiece);

    for (let f of txtFiles) {
      form.append("files", f);
    }

    try {
      const res = await fetch(`${API}/pieces/upload_txt`, {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        setTxtFiles([]);
        loadTxtList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTxt = async (filename) => {
    try {
      const res = await fetch(
        `${API}/pieces/${encodeURIComponent(selectedGroup)}/${encodeURIComponent(
          selectedPiece
        )}/txt/${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        loadTxtList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSelected = async () => {
    for (const file of selected) {
      await deleteTxt(file);
    }
    setSelected([]);
  };

  const toggleSelect = (file) => {
    setSelected(prev =>
      prev.includes(file)
        ? prev.filter(item => item !== file)
        : [...prev, file]
    );
  };

  const extractData = async () => {
    setLoadingExtract(true);

    try {
      const res1 = await fetch(
        `${API}/pieces/${encodeURIComponent(selectedGroup)}/${encodeURIComponent(selectedPiece)}/extract_to_csv`,
        { method: "POST" }
      );

      if (!res1.ok) return;

      const res2 = await fetch(
        `${API}/pieces/${encodeURIComponent(selectedGroup)}/${encodeURIComponent(selectedPiece)}/dataframe`
      );

      const json2 = await res2.json();

      if (res2.ok) {
        onDataExtracted(json2.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExtract(false);
    }
  };

  return (
  <>
    {/* UPLOAD TXT */}
    <div className="card">
      <h2>Importar</h2>

      <label className="file-input-sm">
        <FileText size={14} />
        {txtFiles.length > 0 ? `${txtFiles.length} arq` : "TXT"}
        <input
          type="file"
          multiple
          accept=".txt"
          onChange={(e) => setTxtFiles([...e.target.files])}
        />
      </label>

      <button
        className="btn-sm btn-primary"
        onClick={uploadTxt}
        disabled={!selectedGroup || !selectedPiece || txtFiles.length === 0}
        title="Enviar"
      >
        <Upload size={16} />
      </button>
    </div>

    {/* LISTAR TXT */}
    <div className="card">
      <h2>Arquivos</h2>

      {/* A caixa SEMPRE aparece */}
      <div className="txt-box-sm">
        {txtList.length === 0 ? (
          <p className="info-text-sm">No file</p>
        ) : (
          txtList.map((file) => (
            <label key={file} className="txt-line-sm">
              <input
                type="checkbox"
                checked={selected.includes(file)}
                onChange={() => toggleSelect(file)}
              />
              <span>{file.substring(0, 12)}...</span>
            </label>
          ))
        )}
      </div>

      {/* Botões SEMPRE aparecem */}
      <div className="btn-row">
        <button
          className="btn-sm btn-danger"
          onClick={deleteSelected}
          disabled={selected.length === 0}
          title="Apagar"
        >
          <Trash2 size={16} />
        </button>

        <button
          className="btn-sm btn-primary"
          onClick={extractData}
          disabled={loadingExtract}
          title="Extrair"
        >
          {loadingExtract ? "⏳" : <RefreshCw size={16} />}
        </button>
      </div>
    </div>
  </>
);
};
