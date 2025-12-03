"use client";

import { useState, useEffect } from "react";
import { FolderPlus, Trash2, PlayCircle, Pause } from "lucide-react";

export default function GroupManager({
  groups,
  onGroupCreated,
  onGroupDeleted,
  onGroupSelected,
  selectedGroup,
  onJobCreated, 
  onJobFinished
}) {
  const [newGroup, setNewGroup] = useState("");
  const [loading, setLoading] = useState(false); 
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  //update the currentJobId from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedJobId = localStorage.getItem("current_jobid");
      setCurrentJobId(storedJobId);
    }
  }, []);

  const createGroup = async () => {
    if (!newGroup.trim()) return;
    
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

  const createJobId = async () => {
    if (!selectedGroup) return;

    setJobLoading(true);

    try {
      const res = await fetch(`${API}/jobs/create?group=${selectedGroup}`, {
        method: "POST"
      });

      const data = await res.json();

      if (data.jobid) {
        localStorage.setItem("current_jobid", data.jobid);
        setCurrentJobId(data.jobid);

        if (onJobCreated) {
          onJobCreated(data.jobid);
        }
      }
    } catch (err) {
      console.error("Erro ao criar job:", err);
    } finally {
      setJobLoading(false);
      setShowJobModal(false);
    }
  };

  const finishJob = async () => {
    if (!currentJobId) {
      alert("Nenhum job ativo para encerrar");
      setShowFinishModal(false);
      return;
    }

    setFinishLoading(true);

    try {
      const res = await fetch(`${API}/jobs/job/${currentJobId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao encerrar job");
      }

      const data = await res.json();
      console.log("Job encerrado:", data);

      //delete from localStorage and update the state
      localStorage.removeItem("current_jobid");
      setCurrentJobId(null);

      if (onJobFinished) {
        onJobFinished();
      }

      alert("Job encerrado com sucesso!");

    } catch (err) {
      console.error("Erro ao encerrar job:", err);
      alert(`Erro ao encerrar job: ${err.message}`);
    } finally {
      setFinishLoading(false);
      setShowFinishModal(false);
    }
  };

  return (
    <>
      {/*modal create job id*/}
      {showJobModal && (
        <div className="modal-overlay-fixed">
          <div className="modal-box">
            <h3>Criar Job_id para o {selectedGroup}?</h3>

            <p className="modal-text">
              Isso criará um identificador único job_id para poder gerar o relatório final.
            </p>

            <div className="modal-buttons">
              <button
                className="btn-sm btn-danger"
                onClick={() => setShowJobModal(false)}
                disabled={jobLoading}
              >
                Cancelar
              </button>

              <button
                className="btn-sm btn-success"
                onClick={createJobId}
                disabled={jobLoading}
              >
                {jobLoading ? "Criando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*modal delete job*/}
      {showFinishModal && (
        <div className="modal-overlay-fixed">
          <div className="modal-box">
            <h3>Encerrar Job?</h3>

            <p className="modal-text">
              Isso apagará o job_id atual e você poderá iniciar outro.  
              {currentJobId && (
                <>
                  <br />
                  Job_id atual: <b>{currentJobId}</b>
                </>
              )}
            </p>

            <div className="modal-buttons">
              <button
                className="btn-sm btn-secondary"
                onClick={() => setShowFinishModal(false)}
                disabled={finishLoading}
              >
                Cancelar
              </button>

              <button
                className="btn-sm btn-danger"
                onClick={finishJob}
                disabled={finishLoading}
              >
                {finishLoading ? "Encerrando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*create group*/}
      <div className="card">
        <h2>Novo Conjunto</h2>
        <div className="form">
          <input
            className="input-sm"
            type="text"
            placeholder="Nome do conjunto"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newGroup.trim()) {
                createGroup();
              }
            }}
          />
          <button 
            className="btn-sm btn-success" 
            onClick={createGroup} 
            disabled={loading || !newGroup.trim()}
          >
            <FolderPlus size={16} />
          </button>
        </div>
      </div>

      {/*select group*/}
      <div className="card">
        <h2>Conjunto</h2>
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

        <div className="actions-row"> 
          <button
            className="btnRow"
            disabled={!selectedGroup || currentJobId}
            onClick={() => setShowJobModal(true)}
            title={currentJobId ? "Já existe um job ativo" : "Criar Job"}
          >
            <PlayCircle size={21} />
          </button>

          <button
            className="btnRow"
            onClick={() => setShowFinishModal(true)}
            disabled={!currentJobId}
            title={!currentJobId ? "Nenhum job ativo" : "Encerrar Job"}
          >
            <Pause size={21} />
          </button>

          <button
            className="btnRow"
            onClick={deleteGroup}
            disabled={!selectedGroup}
            title="Apagar conjunto"
          >
            <Trash2 size={21} />
          </button>
        </div>
      </div>
    </>
  );
} 
