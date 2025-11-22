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
  const [txtFiles, setTxtFiles] = useState([]); 
  const [txtList, setTxtList] = useState([]);
  const [selected, setSelected] = useState([]);

  const [parsedData, setParsedData] = useState([]);
  const [loadingExtract, setLoadingExtract] = useState(false);


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

  const deleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const res = await fetch(`${API}/groups/${selectedGroup}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMsg(`Grupo "${selectedGroup}" apagado!`);
        setSelectedGroup("");
        setPieces([]);
        loadGroups();
      } else {
        setMsg(`Erro: ${data.detail}`);
      }
    } catch {
      setMsg("Erro ao apagar grupo.");
    }
  };

  //txtfiles upload
  const uploadTxt = async () => {
    if (!selectedGroup || !selectedPiece || txtFiles.length === 0) {
      setMsg("Selecione grupo, peça e arquivos TXT.");
      return;
  }

  const form = new FormData();
    form.append("group", selectedGroup);
    form.append("piece", selectedPiece);

    for (let f of txtFiles) {
      form.append("files", f);
    }

    try {
      const res = await fetch(`${API}/pieces/upload_txt`, {
        method: "POST",
        body: form, // <-- sem headers aqui!
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(`Erro: ${data.detail || "Falha ao enviar TXT"}`);
        return;
      }

      setMsg(`TXT enviado com sucesso! (${data.saved.length} arquivos)`);
      setTxtFiles([]);
      loadTxtList();      
    } catch (err) {
      setMsg("Erro ao enviar TXT.");
    }
  };

  const loadTxtList = async () => {
    if (!selectedGroup || !selectedPiece) {
      setTxtList([]);
      return;
    }
  
    try {
      const res = await fetch(`${API}/pieces/${selectedGroup}/${selectedPiece}/txt`);
      const data = await res.json();
  
      if (!res.ok) {
        setMsg(`Erro ao listar TXT: ${data.detail}`);
        setTxtList([]);
        return;
      }

      setTxtList(data);
    } catch {
      setMsg("Erro ao carregar arquivos TXT.");
      setTxtList([]);
  }
};

  //load list txt
  useEffect(() => {
    if (selectedPiece && selectedGroup) {
      loadTxtList();
    } else {
      setTxtList([]);
    }
  }, [selectedPiece, selectedGroup]);


  const deleteTxt = async (filename) => {
    if (!selectedGroup || !selectedPiece) return;

    try {
      const res = await fetch(
        `${API}/pieces/${encodeURIComponent(selectedGroup)}/${encodeURIComponent(
          selectedPiece
        )}/txt/${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsg(`Erro ao apagar TXT: ${data.detail}`);
        return;
      }

      setMsg(`Arquivo '${filename}' removido!`);
      loadTxtList();
    } catch {
      setMsg("Erro ao apagar TXT.");
    }
  };

  function toggleSelect(file) {
    setSelected(prev =>
      prev.includes(file)
        ? prev.filter(item => item !== file)
        : [...prev, file]
    );
  }

  async function deleteSelected() {
    for (const file of selected) {
      await deleteTxt(file); 
    }
    setTxtList(prev => prev.filter(item => !selected.includes(item)));
    setSelected([]);
  }


  const extractData = async () => {
    if (!selectedGroup || !selectedPiece) {
      setMsg("Selecione grupo e peça antes de extrair.");
      return;
    }

  setLoadingExtract(true);
  setMsg(null);

  try {
    // 1) extrai txt -> csv
    const res1 = await fetch(`${API}/pieces/${encodeURIComponent(selectedGroup)}/${encodeURIComponent(selectedPiece)}/extract_to_csv`, {
      method: "POST",
    });
    const json1 = await res1.json();
    if (!res1.ok) {
      setMsg(`Erro na extração: ${json1.detail || JSON.stringify(json1)}`);
      setLoadingExtract(false);
      return;
    }

    // 2) carrega dataframe concatenado
    const res2 = await fetch(`${API}/pieces/${encodeURIComponent(selectedGroup)}/${encodeURIComponent(selectedPiece)}/dataframe`);
    const json2 = await res2.json();
    if (!res2.ok) {
      setMsg(`Erro ao obter dataframe: ${json2.detail || JSON.stringify(json2)}`);
      setLoadingExtract(false);
      return;
    }

    setParsedData(json2.data || []);
    setMsg(`Extração pronta — ${json2.rows} linhas.`);
  } catch (err) {
    console.error(err);
    setMsg("Erro ao extrair dados.");
  } finally {
    setLoadingExtract(false);
  }
};


  return (
    <div className="page-container">
      <h1 className="title">LEAN SIX SIGMA</h1>

      {msg && <p className="message">{msg}</p>}

      <div className="grid unified-card">

        {/* create group*/}
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

        {/*select/delet group  */}
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

          <button
            className="btn-danger"
            onClick={deleteGroup}
            disabled={!selectedGroup}
          >
            Apagar Grupo
          </button>
        </div>

        {/*create part */}
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

        {/*list part */}
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
            className="btn"
            onClick={extractData}
            disabled={!selectedGroup || !selectedPiece || loadingExtract}
          >
            {loadingExtract ? "Extraindo..." : "Extrair Dados"}
          </button>

          <button
            className="btn-danger"
            onClick={deletePiece}
            disabled={!selectedPiece}
          >
            Apagar Peça
          </button>
        </div>

        {/* upload txt */}
        <div className="card">
          <h2>Importar TXT do PCDMIS</h2>
          
          <input
            type="file"
            className="input"
            multiple
            accept=".txt"
            onChange={(e) => setTxtFiles([...e.target.files])}
          />

          <button
           className="btn"
           onClick={uploadTxt}
           disabled={!selectedGroup || !selectedPiece || txtFiles.length === 0}
          >
            Enviar TXT
          </button>
        </div>

        {/*list txt*/}
        <div className="card">
          <h2>Arquivos TXT Importados</h2>

          {!selectedPiece && (
            <p className="selected-text">Selecione uma peça para ver os TXT.</p>
          )}

          {selectedPiece && txtList.length === 0 && (
            <p className="selected-text">Nenhum TXT importado ainda.</p>
          )}

          {txtList && (
            <div>
      
              <div className="txt-box">
                {txtList.map((file) => (
                  <label key={file} className="txt-line">
                    <input
                      type="checkbox"
                      checked={selected.includes(file)}
                      onChange={() => toggleSelect(file)}
                    />
                    {file}
                  </label>
                ))}
              </div>
      
              <button
                className="btn-danger"
                onClick={deleteSelected}
                disabled={selected.length === 0}
              >
                Apagar Selecionados
              </button>
      
            </div>
          )}
        </div>

        {parsedData && parsedData.length > 0 && (
          <div className="card-table" style={{ marginTop: 20 }}>
            <h2>Dados extraídos ({parsedData.length} linhas)</h2>

            <div style={{ overflowX: "auto" }}>
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
    </div>
  );
};
